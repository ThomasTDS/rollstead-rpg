import { z } from 'zod'
import { createTable, expect, joinTable, test, type SignedInUser } from './fixtures'

function requestTable({ api }: SignedInUser, name: string) {
  return api.post('rpc/create_table', { data: { table_name: name } })
}

async function tableNames({ api }: SignedInUser) {
  const response = await api.get('game_tables?select=name&order=name')
  const tables = z.array(z.strictObject({ name: z.string() })).parse(await response.json())
  return tables.map((table) => table.name)
}

test.describe('Table names', () => {
  test('are unique per master, ignoring case and surrounding spaces', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    await createTable(ana, 'DnD')

    expect((await requestTable(ana, 'DnD')).status()).toBe(409)
    expect((await requestTable(ana, 'dnd')).status()).toBe(409)
    expect((await requestTable(ana, 'dnd ')).status()).toBe(409)
    expect(await tableNames(ana)).toEqual(['DnD'])
  })

  test('create a single table from simultaneous requests', async ({ signInAs }) => {
    const ana = await signInAs('Ana')

    const responses = await Promise.all(
      Array.from({ length: 5 }, () => requestTable(ana, 'Mesa disputada')),
    )

    const statuses = responses.map((response) => response.status()).sort()
    expect(statuses).toEqual([200, 409, 409, 409, 409])
    expect(await tableNames(ana)).toEqual(['Mesa disputada'])
  })

  test('can repeat between different masters', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')

    await createTable(ana, 'DnD')
    await createTable(bia, 'DnD')

    expect(await tableNames(ana)).toEqual(['DnD'])
    expect(await tableNames(bia)).toEqual(['DnD'])
  })

  test('cannot be taken by renaming', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    await createTable(ana, 'DnD')
    const tableId = await createTable(ana, 'Outra')

    const response = await ana.api.patch(`game_tables?id=eq.${tableId}`, {
      data: { name: 'dnd' },
    })

    expect(response.status()).toBe(409)
    expect(await tableNames(ana)).toEqual(['DnD', 'Outra'])
  })
})

test.describe('Managing a table', () => {
  test('is denied to players', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)

    await bia.api.patch(`game_tables?id=eq.${tableId}`, { data: { name: 'Hacked' } })
    await bia.api.delete(`game_tables?id=eq.${tableId}`)
    const takeover = await bia.api.patch(`game_tables?id=eq.${tableId}`, {
      data: { master_id: bia.id },
    })

    expect(takeover.status()).toBe(403)
    expect(await tableNames(ana)).toEqual(['Mesa da Ana'])
  })

  test('deleting removes the table for everyone and frees the name', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)

    const response = await ana.api.delete(`game_tables?id=eq.${tableId}`)

    expect(response.status()).toBe(204)
    expect(await tableNames(ana)).toEqual([])
    expect(await tableNames(bia)).toEqual([])
    await createTable(ana, 'Mesa da Ana')
  })
})
