import type { Page, TestInfo } from '@playwright/test'
import { readLoginEmail, uniqueEmail } from '../support/local-supabase'
import { expect, test } from '../e2e/fixtures'
import { DisplayNamePage } from '../e2e/pages/display-name.page'
import { InvitePage } from '../e2e/pages/invite.page'
import { LoginPage } from '../e2e/pages/login.page'
import { TablePage } from '../e2e/pages/table.page'
import { TablesPage } from '../e2e/pages/tables.page'

// The walk happens once, in Portuguese, because the page objects find elements by their
// Portuguese text. Theme and language then change in place at each stop, so screens that
// exist only after an action (a dialog, a popover) are captured in every combination.
const OUTPUT_DIR = process.env.SCREENS_OUTPUT ?? 'screenshots'
const LANGUAGES = (process.env.SCREENS_LANGUAGES ?? 'pt-BR,en,es').split(',')
const THEMES = ['light', 'dark'] as const
const WALK_LANGUAGE = 'pt-BR'
const TABLE = 'A Mina Perdida'

async function selectLanguage(page: Page, language: string) {
  await page.getByRole('banner').getByRole('combobox').selectOption(language)
  await expect(page.locator('html')).toHaveAttribute('lang', language)
}

/** Waits for the text and the fonts of the language just selected to be painted. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
  })
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  for (const language of LANGUAGES) {
    await selectLanguage(page, language)
    for (const colorScheme of THEMES) {
      await page.emulateMedia({ colorScheme })
      await settle(page)
      await page.screenshot({
        path: `${OUTPUT_DIR}/${language}/${colorScheme}/${testInfo.project.name}/${name}.png`,
        fullPage: true,
        animations: 'disabled',
      })
    }
  }
  await selectLanguage(page, WALK_LANGUAGE)
}

async function enterAs(page: Page, account: string) {
  await page.goto('/entrar')
  await page.getByRole('button', { name: `Entrar como ${account}` }).click()
  await new TablesPage(page).title.waitFor()
}

test('capture every screen', async ({ page, browser, mailpitUrl }, testInfo) => {
  const shot = (name: string, on: Page = page) => capture(on, testInfo, name)

  await test.step('signed out', async () => {
    await page.goto('/')
    await shot('01-inicio')

    await page.goto('/entrar')
    await new LoginPage(page).emailInput.waitFor()
    await shot('02-entrar')
  })

  let invitePath = ''

  await test.step('master', async () => {
    await enterAs(page, 'Ana (Mestre)')
    const tables = new TablesPage(page)
    await tables.row(TABLE).waitFor()
    await shot('03-minhas-mesas')

    await tables.portrait('Bia, jogador').first().hover()
    await tables.tooltip('Bia').waitFor()
    await shot('04-dica-de-retrato')
    await page.mouse.move(0, 0)

    await tables.moreButton(1).click()
    await page.locator('[popover]:popover-open').waitFor()
    await shot('05-lista-de-participantes')
    await page.keyboard.press('Escape')

    await page.getByRole('link', { name: TABLE }).click()
    const table = new TablePage(page)
    await table.manageTitle.waitFor()
    await table.member('Bia').waitFor()
    await shot('06-mesa-do-mestre')

    await table.generateButton.or(table.regenerateButton).click()
    await table.linkInput.waitFor()
    invitePath = new URL(await table.linkInput.inputValue()).pathname
    await shot('07-convite-gerado')

    await table.removeButton('Bia').click()
    await table.removeConfirmButton.waitFor()
    await shot('08-remover-jogador')
    await page.reload()

    await table.deleteOpenButton.click()
    await table.deleteConfirmInput.waitFor()
    await shot('09-excluir-mesa')

    await page.goto('/mesas/00000000-0000-4000-8000-000000000000')
    await table.notFound.waitFor()
    await shot('10-mesa-nao-encontrada')
  })

  const playerContext = await browser.newContext()
  const newcomerContext = await browser.newContext()

  await test.step('player', async () => {
    const player = await playerContext.newPage()
    await enterAs(player, 'Bia (Jogador)')
    await player.getByRole('link', { name: TABLE }).click()
    const table = new TablePage(player)
    await table.leaveOpenButton.click()
    await table.leaveConfirmButton.waitFor()
    await shot('11-sair-da-mesa', player)
  })

  await test.step('newcomer', async () => {
    const newcomer = await newcomerContext.newPage()
    const login = new LoginPage(newcomer)
    const email = uniqueEmail()

    await login.goto()
    await login.requestCode(email)
    await login.codeInput.waitFor()
    await shot('12-digitar-codigo', newcomer)

    await login.submitCode('000000')
    await login.alert.waitFor()
    await shot('13-codigo-errado', newcomer)

    const { code } = await readLoginEmail(mailpitUrl, email)
    await login.submitCode(code)
    const displayName = new DisplayNamePage(newcomer)
    await displayName.title.waitFor()
    await shot('14-como-quer-ser-chamado', newcomer)

    await displayName.save('Nina')
    const tables = new TablesPage(newcomer)
    await tables.emptyMessage.waitFor()
    await shot('15-lista-vazia', newcomer)

    await newcomer.goto(invitePath)
    const invite = new InvitePage(newcomer)
    await invite.joinButton.waitFor()
    await shot('16-convite-recebido', newcomer)

    await newcomer.goto('/convite/invalido')
    await invite.invalidTitle.waitFor()
    await shot('17-convite-invalido', newcomer)
  })

  await playerContext.close()
  await newcomerContext.close()
})
