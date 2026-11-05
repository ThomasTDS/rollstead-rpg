import { createTable, expect, joinTable, test, type SignedInUser } from './fixtures'

async function listTables({ api }: SignedInUser) {
  const response = await api.post('rpc/list_my_tables')
  expect(response.status()).toBe(200)
  return (await response.json()) as { id: string; role: string; participants: object[] }[]
}

async function listSeats({ api }: SignedInUser, tableId: string) {
  const response = await api.post('rpc/list_table_seats', { data: { target_table: tableId } })
  expect(response.status()).toBe(200)
  return (await response.json()) as object[]
}

test.describe('Participants', () => {
  test('come with name and role only, master first and players by arrival', async ({
    signInAs,
  }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const caio = await signInAs('Caio')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)
    await joinTable(ana, caio, tableId)

    const [table] = await listTables(caio)

    expect(table?.role).toBe('player')
    expect(table?.participants).toStrictEqual([
      { display_name: 'Ana', role: 'master' },
      { display_name: 'Bia', role: 'player' },
      { display_name: 'Caio', role: 'player' },
    ])
  })

  test('are out of reach of anon and outsiders', async ({ anonApi, signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')

    expect((await anonApi.post('rpc/list_my_tables')).status()).toBe(401)
    expect(await listTables(bia)).toEqual([])
    expect(await listSeats(bia, tableId)).toEqual([])
  })

  test('disappear from the list when they leave', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)

    await bia.api.delete(`table_members?table_id=eq.${tableId}&user_id=eq.${bia.id}`)

    const [table] = await listTables(ana)
    expect(table?.participants).toStrictEqual([{ display_name: 'Ana', role: 'master' }])
  })
})

test.describe('User ids', () => {
  test('reach only the master of the table', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)

    expect(await listSeats(ana, tableId)).toStrictEqual([
      { user_id: ana.id, display_name: 'Ana' },
      { user_id: bia.id, display_name: 'Bia' },
    ])
    expect(await listSeats(bia, tableId)).toEqual([])
  })

  test('cannot be read by a player through any table', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)

    const seats = await bia.api.get(`table_members?select=user_id&table_id=eq.${tableId}`)
    expect(await seats.json()).toEqual([{ user_id: bia.id }])

    const profiles = await bia.api.get('profiles?select=id')
    expect(await profiles.json()).toEqual([{ id: bia.id }])

    const master = await bia.api.get(`game_tables?select=master_id&id=eq.${tableId}`)
    expect(master.status()).toBe(403)
    const everything = await bia.api.get(`game_tables?select=*&id=eq.${tableId}`)
    expect(everything.status()).toBe(403)
  })
})
