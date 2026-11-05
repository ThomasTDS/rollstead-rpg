import { z } from 'zod'
import { createTable, expect, joinTable, test, type SignedInUser } from './fixtures'

function removeSeat({ api }: SignedInUser, tableId: string, userId: string) {
  return api.delete(`table_members?table_id=eq.${tableId}&user_id=eq.${userId}`)
}

async function seats({ api }: SignedInUser, tableId: string) {
  const response = await api.get(`table_members?select=user_id&table_id=eq.${tableId}`)
  const rows = z.array(z.object({ user_id: z.uuid() })).parse(await response.json())
  return rows.map((row) => row.user_id)
}

test.describe('Removing a player', () => {
  test('the master removes a player, who loses access at once', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)

    const response = await removeSeat(ana, tableId, bia.id)

    expect(response.status()).toBe(204)
    expect(await seats(ana, tableId)).toEqual([ana.id])
    expect(await seats(bia, tableId)).toEqual([])
    const table = await bia.api.get(`game_tables?select=name&id=eq.${tableId}`)
    expect(await table.json()).toEqual([])
  })

  test('a player cannot remove another player', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const caio = await signInAs('Caio')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)
    await joinTable(ana, caio, tableId)

    await removeSeat(bia, tableId, caio.id)

    expect(await seats(ana, tableId)).toHaveLength(3)
  })

  test('someone outside the table cannot remove anyone', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const caio = await signInAs('Caio')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)

    await removeSeat(caio, tableId, bia.id)

    expect(await seats(ana, tableId)).toHaveLength(2)
  })

  test('a removed player can return with a valid invite', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)
    await removeSeat(ana, tableId, bia.id)

    await joinTable(ana, bia, tableId)

    expect(await seats(bia, tableId)).toEqual([bia.id])
  })
})

test.describe('Leaving a table', () => {
  test('a player leaves on their own', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Mesa da Ana')
    await joinTable(ana, bia, tableId)

    const response = await removeSeat(bia, tableId, bia.id)

    expect(response.status()).toBe(204)
    expect(await seats(ana, tableId)).toEqual([ana.id])
  })

  test('the master cannot leave their own table', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const tableId = await createTable(ana, 'Mesa da Ana')

    const response = await removeSeat(ana, tableId, ana.id)

    expect(response.status()).toBe(409)
    expect(await seats(ana, tableId)).toEqual([ana.id])
  })
})
