import { z } from 'zod'
import { createTable, expect, test, type SignedInUser } from './fixtures'

const tokenSchema = z.string().regex(/^[0-9a-f]{64}$/)

// strictObject: any extra field in the response fails the test
const invitePreviewSchema = z
  .array(
    z.strictObject({
      table_id: z.uuid(),
      table_name: z.string(),
      is_member: z.boolean(),
    }),
  )
  .length(1)

const seatsSchema = z.array(
  z.strictObject({
    profiles: z.strictObject({ display_name: z.string() }),
  }),
)

async function createInvite({ api }: SignedInUser, tableId: string) {
  const response = await api.post('rpc/create_invite', { data: { target_table: tableId } })
  expect(response.status()).toBe(200)
  return tokenSchema.parse(await response.json())
}

function join({ api }: SignedInUser, token: string) {
  return api.post('rpc/join_table', { data: { invite_token: token } })
}

test.describe('Invites', () => {
  test('are out of reach of the anon key', async ({ anonApi }) => {
    const response = await anonApi.post('rpc/join_table', { data: { invite_token: 'x' } })

    expect(response.status()).toBe(401)
  })

  test('show an outsider only the table name', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    const token = await createInvite(ana, tableId)

    const response = await bia.api.post('rpc/get_invite', { data: { invite_token: token } })
    const [invite] = invitePreviewSchema.parse(await response.json())

    expect(invite).toEqual({ table_id: tableId, table_name: 'Mesa da Ana', is_member: false })
  })

  test('let members read each other by name, never by email', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    const token = await createInvite(ana, tableId)

    expect((await join(bia, token)).status()).toBe(200)

    const response = await bia.api.get(
      `table_members?select=profiles(display_name)&table_id=eq.${tableId}&order=joined_at`,
    )
    expect(seatsSchema.parse(await response.json())).toEqual([
      { profiles: { display_name: 'Ana' } },
      { profiles: { display_name: 'Bia' } },
    ])
  })

  test('are managed only by the master', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await join(bia, await createInvite(ana, tableId))
    const data = { target_table: tableId }

    expect((await bia.api.post('rpc/create_invite', { data })).status()).toBe(403)
    expect((await bia.api.post('rpc/revoke_invite', { data })).status()).toBe(403)
    const invites = await bia.api.get('table_invites?select=expires_at')
    expect(await invites.json()).toEqual([])
  })

  test('never reveal the token hash, not even to the master', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    await createInvite(ana, await createTable(ana, 'Mesa da Ana'))

    expect((await ana.api.get('table_invites?select=token_hash')).status()).toBe(403)
    expect((await ana.api.get('table_invites?select=*')).status()).toBe(403)
  })

  test('refuse a tampered link', async ({ signInAs }) => {
    const bia = await signInAs('Bia')

    const response = await join(bia, 'a'.repeat(64))

    expect(response.status()).toBe(400)
    expect(await response.json()).toMatchObject({ message: 'invite_invalid' })
  })

  test('stop working when revoked', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    const token = await createInvite(ana, tableId)

    await ana.api.post('rpc/revoke_invite', { data: { target_table: tableId } })

    expect((await join(bia, token)).status()).toBe(400)
  })

  test('stop working when replaced by a new link', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    const oldToken = await createInvite(ana, tableId)
    const newToken = await createInvite(ana, tableId)

    expect((await join(bia, oldToken)).status()).toBe(400)
    expect((await join(bia, newToken)).status()).toBe(200)
  })

  test('never seat more than 8 players, even at the same time', async ({ signInAs }) => {
    test.slow()
    const ana = await signInAs('Ana')
    const tableId = await createTable(ana, 'Mesa cheia')
    const token = await createInvite(ana, tableId)
    const players = await Promise.all(
      Array.from({ length: 9 }, (_, index) => signInAs(`Jogador ${String(index + 1)}`)),
    )

    const responses = await Promise.all(players.map((player) => join(player, token)))

    const statuses = responses.map((response) => response.status()).sort()
    expect(statuses).toEqual([...Array<number>(8).fill(200), 400])
    const refused = responses.find((response) => response.status() === 400)
    expect(await refused?.json()).toMatchObject({ message: 'table_full' })
  })
})
