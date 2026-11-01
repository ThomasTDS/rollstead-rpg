import { z } from 'zod'
import { expect, test } from './fixtures'

const healthCheckSchema = z
  .array(
    z.strictObject({
      id: z.literal(1),
      status: z.literal('ok'),
      updated_at: z.iso.datetime({ offset: true }),
    }),
  )
  .length(1)

test.describe('GET /rest/v1/health_check', () => {
  test('returns the single health row to the anon key', async ({ anonApi }) => {
    const response = await anonApi.get('health_check?select=*')

    expect(response.status()).toBe(200)
    // parse() throws with the exact mismatch when the response breaks the contract
    healthCheckSchema.parse(await response.json())
  })

  test('rejects writes from the anon key', async ({ anonApi }) => {
    const response = await anonApi.post('health_check', { data: { id: 1, status: 'hacked' } })

    expect(response.status()).toBe(401)
  })
})
