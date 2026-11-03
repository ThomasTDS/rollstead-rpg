import { z } from 'zod'
import { expect, test } from './fixtures'

// strictObject: any extra field in the response, such as an email, fails the test
const profilesSchema = z.array(
  z.strictObject({
    id: z.uuid(),
    display_name: z.string(),
    created_at: z.iso.datetime({ offset: true }),
  }),
)

test.describe('/rest/v1/profiles', () => {
  test('hides every profile from the anon key', async ({ anonApi }) => {
    const response = await anonApi.get('profiles?select=*')

    expect(response.status()).toBe(401)
  })

  test('lets a user create and read only their own profile', async ({ signIn }) => {
    const ana = await signIn()
    const bia = await signIn()

    const created = await ana.api.post('profiles', {
      data: { id: ana.id, display_name: 'Ana' },
    })
    expect(created.status()).toBe(201)
    await bia.api.post('profiles', { data: { id: bia.id, display_name: 'Bia' } })

    const response = await ana.api.get('profiles?select=*')
    const profiles = profilesSchema.parse(await response.json())

    expect(profiles.map((profile) => profile.display_name)).toEqual(['Ana'])
  })

  test('rejects a profile created for someone else', async ({ signIn }) => {
    const ana = await signIn()
    const bia = await signIn()

    const response = await ana.api.post('profiles', {
      data: { id: bia.id, display_name: 'Fake' },
    })

    expect(response.status()).toBe(403)
  })

  test('does not let a user rename someone else', async ({ signIn }) => {
    const ana = await signIn()
    const bia = await signIn()
    await bia.api.post('profiles', { data: { id: bia.id, display_name: 'Bia' } })

    await ana.api.patch(`profiles?id=eq.${bia.id}`, { data: { display_name: 'Hacked' } })

    const response = await bia.api.get('profiles?select=*')
    const profiles = profilesSchema.parse(await response.json())
    expect(profiles.map((profile) => profile.display_name)).toEqual(['Bia'])
  })

  test.describe('rejects an invalid name', () => {
    for (const [title, displayName] of [
      ['empty', ''],
      ['with 41 characters', 'a'.repeat(41)],
    ] as const) {
      test(title, async ({ signIn }) => {
        const ana = await signIn()

        const response = await ana.api.post('profiles', {
          data: { id: ana.id, display_name: displayName },
        })

        expect(response.status()).toBe(400)
      })
    }
  })
})
