import { z } from 'zod'
import { createTable, expect, test, type SignedInUser } from './fixtures'

// strictObject: any extra field in the response, such as an email, fails the test
const membersSchema = z.array(
  z.strictObject({
    table_id: z.uuid(),
    user_id: z.uuid(),
    joined_at: z.iso.datetime({ offset: true }),
    profiles: z.strictObject({ display_name: z.string() }),
  }),
)

async function tableNames({ api }: SignedInUser) {
  const response = await api.get('game_tables?select=name')
  const tables = z.array(z.strictObject({ name: z.string() })).parse(await response.json())
  return tables.map((table) => table.name)
}

test.describe('Game tables', () => {
  test('are hidden from the anon key', async ({ anonApi }) => {
    expect((await anonApi.get('game_tables?select=*')).status()).toBe(401)
    expect((await anonApi.get('table_members?select=*')).status()).toBe(401)
    const created = await anonApi.post('rpc/create_table', { data: { table_name: 'Anon' } })
    expect(created.status()).toBe(401)
  })

  test('make their creator the master, with no email in the members', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const tableId = await createTable(ana, 'Mesa da Ana')

    const response = await ana.api.get(
      `table_members?select=*,profiles(display_name)&table_id=eq.${tableId}`,
    )
    const members = membersSchema.parse(await response.json())

    expect(members).toHaveLength(1)
    expect(members[0]).toMatchObject({ user_id: ana.id, profiles: { display_name: 'Ana' } })

    const table = await ana.api.get(`game_tables?select=master_id&id=eq.${tableId}`)
    expect(await table.json()).toEqual([{ master_id: ana.id }])
  })

  test('stay out of reach of outsiders', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')

    expect(await tableNames(bia)).toEqual([])
    const members = await bia.api.get(`table_members?select=*&table_id=eq.${tableId}`)
    expect(await members.json()).toEqual([])

    await bia.api.patch(`game_tables?id=eq.${tableId}`, { data: { name: 'Hacked' } })
    expect(await tableNames(ana)).toEqual(['Mesa da Ana'])
  })

  test('can be renamed by their master', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const tableId = await createTable(ana, 'Mesa da Ana')

    const response = await ana.api.patch(`game_tables?id=eq.${tableId}`, {
      data: { name: 'Nova mesa' },
    })

    expect(response.status()).toBe(204)
    expect(await tableNames(ana)).toEqual(['Nova mesa'])
  })

  test('cannot be written directly', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const tableId = await createTable(ana, 'Mesa da Ana')

    const newTable = await ana.api.post('game_tables', { data: { name: 'Sem mestre' } })
    expect(newTable.status()).toBe(403)

    const newMember = await ana.api.post('table_members', {
      data: { table_id: tableId, user_id: ana.id },
    })
    expect(newMember.status()).toBe(403)

    const edited = await ana.api.patch(`table_members?table_id=eq.${tableId}`, {
      data: { user_id: ana.id },
    })
    expect(edited.status()).toBe(403)
  })

  test.describe('reject an invalid name', () => {
    for (const [title, name] of [
      ['empty', ''],
      ['with 61 characters', 'a'.repeat(61)],
    ] as const) {
      test(title, async ({ signInAs }) => {
        const ana = await signInAs('Ana')

        const response = await ana.api.post('rpc/create_table', { data: { table_name: name } })

        expect(response.status()).toBe(400)
        expect(await tableNames(ana)).toEqual([])
      })
    }
  })
})
