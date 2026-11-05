import { z } from 'zod'
import { createTable, expect, joinTable, test, type SignedInUser } from './fixtures'

const tablesSchema = z.array(z.object({ name: z.string() }))

async function tableNames({ api }: SignedInUser) {
  const response = await api.post('rpc/list_my_tables')
  return tablesSchema.parse(await response.json()).map((table) => table.name)
}

function reorder({ api }: SignedInUser, tableIds: string[]) {
  return api.post('rpc/reorder_my_tables', { data: { table_ids: tableIds } })
}

test.describe('Table order', () => {
  test('is refused to anon', async ({ anonApi }) => {
    const response = await anonApi.post('rpc/reorder_my_tables', { data: { table_ids: [] } })

    expect(response.status()).toBe(401)
  })

  test('is saved per user, and a new table reaches the top', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const first = await createTable(ana, 'Primeira')
    const second = await createTable(ana, 'Segunda')
    expect(await tableNames(ana)).toEqual(['Segunda', 'Primeira'])

    const response = await reorder(ana, [first, second])

    expect(response.status()).toBe(204)
    expect(await tableNames(ana)).toEqual(['Primeira', 'Segunda'])

    await createTable(ana, 'Nova')
    expect(await tableNames(ana)).toEqual(['Nova', 'Primeira', 'Segunda'])
  })

  test('does not change the list of anyone else', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const first = await createTable(ana, 'Primeira')
    const second = await createTable(ana, 'Segunda')
    await joinTable(ana, bia, first)
    await joinTable(ana, bia, second)
    const biaOrder = await tableNames(bia)

    await reorder(ana, [first, second])
    expect(await tableNames(bia)).toEqual(biaOrder)

    await reorder(bia, [second, first])
    expect(await tableNames(ana)).toEqual(['Primeira', 'Segunda'])
  })

  test('cannot be written directly on the seat of another user', async ({ signInAs }) => {
    const ana = await signInAs('Ana')
    const bia = await signInAs('Bia')
    const tableId = await createTable(ana, 'Primeira')
    await joinTable(ana, bia, tableId)

    const response = await ana.api.patch(
      `table_members?table_id=eq.${tableId}&user_id=eq.${bia.id}`,
      { data: { list_position: 1 } },
    )

    expect(response.status()).toBe(403)
  })
})
