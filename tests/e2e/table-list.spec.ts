import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { InvitePage } from './pages/invite.page'
import { TablePage } from './pages/table.page'

const PLAYER_NAMES = ['Bia', 'Caio', 'Duda', 'Edu', 'Fabi', 'Gui', 'Helo', 'Iris']

function participants(count: number) {
  return [
    { display_name: 'Ana', role: 'master' },
    ...PLAYER_NAMES.slice(0, count - 1).map((name) => ({ display_name: name, role: 'player' })),
  ]
}

/** Answers the list with made up tables, so a screen with 7 people needs no 7 accounts. */
async function serveTables(page: Page, ...sizes: number[]) {
  await page.route('**/rest/v1/rpc/list_my_tables', (route) =>
    route.fulfill({
      json: sizes.map((size, index) => ({
        id: `10000000-0000-0000-0000-00000000000${String(index)}`,
        name: `Mesa de ${String(size)} (${String(index)})`,
        role: 'master',
        created_at: '2026-11-04T12:00:00Z',
        participants: participants(size),
      })),
    }),
  )
  await page.goto('/mesas')
}

test.describe('Table list', () => {
  test('shows real participants, master first, and a player who leaves disappears', async ({
    signUp,
    tablesPage,
    tablePage,
    browser,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.manageTitle).toBeVisible()
    const invitePath = await tablePage.generateInvite()

    const context = await browser.newContext({ locale: 'pt-BR' })
    const playerPage = await context.newPage()
    await signUp(playerPage, 'Bia')
    await playerPage.goto(invitePath)
    await new InvitePage(playerPage).joinButton.click()
    const playerTable = new TablePage(playerPage)
    await expect(playerTable.leaveOpenButton).toBeVisible()

    await tablesPage.goto()
    const row = tablesPage.row('A Mina Perdida')
    await expect(row.getByRole('button', { name: /, (mestre|jogador)$/ })).toHaveCount(2)
    await expect(tablesPage.portrait('Ana, mestre')).toBeVisible()
    await expect(tablesPage.portrait('Bia, jogador')).toBeVisible()
    await expect(row.getByText('Ainda sem sessões')).toBeVisible()
    await expect(
      row.getByRole('button', { name: /, (mestre|jogador)$/ }).first(),
    ).toHaveAccessibleName('Ana, mestre')

    await playerTable.leaveOpenButton.click()
    await playerTable.leaveConfirmButton.click()
    await playerPage.waitForURL('**/mesas')

    await page.reload()
    await expect(tablesPage.portrait('Ana, mestre')).toBeVisible()
    await expect(tablesPage.portrait('Bia, jogador')).toHaveCount(0)
    await context.close()
  })

  test('6 people fit with no "+N"; the 7th goes to the popover', async ({
    signUp,
    tablesPage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await serveTables(page, 6, 7)

    const portraits = /, (mestre|jogador)$/
    const six = tablesPage.row('Mesa de 6')
    const seven = tablesPage.row('Mesa de 7')
    await expect(six.getByRole('button', { name: portraits })).toHaveCount(6)
    await expect(six.getByRole('button', { name: /^Mais/ })).toHaveCount(0)
    await expect(seven.getByRole('button', { name: portraits })).toHaveCount(6)
    await expect(tablesPage.moreButton(1)).toHaveText('+1')

    await tablesPage.moreButton(1).click()
    await expect(page.getByText('Gui', { exact: true })).toBeVisible()
  })

  test('the popover works with the keyboard and gives the focus back', async ({
    signUp,
    tablesPage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await serveTables(page, 7)
    const more = tablesPage.moreButton(1)
    const hidden = page.getByText('Gui', { exact: true })

    await more.focus()
    await page.keyboard.press('Enter')
    await expect(hidden).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(hidden).toBeHidden()
    await expect(more).toBeFocused()

    await page.keyboard.press('Space')
    await expect(hidden).toBeVisible()
    await tablesPage.title.click()
    await expect(hidden).toBeHidden()
    await expect(more).toBeFocused()
  })

  test('the popover stays on screen on the last table of a narrow window', async ({
    signUp,
    tablesPage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await page.setViewportSize({ width: 320, height: 480 })
    await serveTables(page, 9, 9, 9, 9)
    const more = tablesPage.row('(3)').getByRole('button', { name: /^Mais/ })
    await more.scrollIntoViewIfNeeded()
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
    })
    // Leaves the button close to the bottom edge, where the popover has to open upwards
    await page.mouse.wheel(0, -180)
    await more.click()

    const popover = page.locator('[popover]:popover-open')
    await expect(popover).toContainText('Iris')
    const box = await popover.boundingBox()
    const anchor = await more.boundingBox()
    if (!box || !anchor) throw new Error('nothing to measure')
    expect(box.y + box.height).toBeLessThanOrEqual(anchor.y)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(320)
    expect(box.y + box.height).toBeLessThanOrEqual(480)
  })

  test('names appear on hover, on focus and on touch and hold', async ({
    signUp,
    tablesPage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await serveTables(page, 2)
    const master = tablesPage.portrait('Ana, mestre')
    const player = tablesPage.portrait('Bia, jogador')

    await master.hover()
    await expect(tablesPage.tooltip('Ana (Mestre)')).toBeVisible()
    await tablesPage.title.hover()
    await expect(tablesPage.tooltip('Ana (Mestre)')).toBeHidden()

    await master.focus()
    await page.keyboard.press('Tab')
    await expect(player).toBeFocused()
    await expect(tablesPage.tooltip('Bia')).toBeVisible()
    await player.blur()
    await expect(tablesPage.tooltip('Bia')).toBeHidden()

    await master.dispatchEvent('pointerdown', { pointerType: 'touch' })
    await expect(tablesPage.tooltip('Ana (Mestre)')).toBeVisible()
    await master.dispatchEvent('pointerup', { pointerType: 'touch' })
    await expect(tablesPage.tooltip('Ana (Mestre)')).toBeHidden()
  })

  test('the creation date is in a tooltip of the session line', async ({
    signUp,
    tablesPage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await serveTables(page, 1)

    await page.getByRole('button', { name: 'Ainda sem sessões' }).hover()

    await expect(tablesPage.tooltip('Criada em 04/11/2026')).toBeVisible()
  })

  for (const scheme of ['light', 'dark'] as const) {
    test(`keeps screenshots of 1, 6 and 7 people in the ${scheme} theme`, async ({
      signUp,
      page,
    }, testInfo) => {
      await signUp(page, 'Ana')
      await page.emulateMedia({ colorScheme: scheme })
      await serveTables(page, 1, 6, 7)
      const more = page.getByRole('button', { name: /^Mais/ })
      await more.click()

      const name = page.getByText('Gui', { exact: true })
      await expect(name).toBeVisible()
      const nameBox = await name.boundingBox()
      const anchor = await more.boundingBox()
      expect(nameBox?.y).toBeGreaterThan(anchor?.y ?? Infinity)
      await page.screenshot({ path: testInfo.outputPath(`table-list-${scheme}.png`) })
    })
  }
})
