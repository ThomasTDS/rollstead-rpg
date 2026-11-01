import budget from '../../performance-budget.json' with { type: 'json' }
import { expect, test } from './fixtures'

const { cpuSlowdown, latencyMs, downloadKbps, uploadKbps, maxSecondsToUsable } = budget.slowDevice

test.describe('Slow device and network', () => {
  test(`home is usable within ${String(maxSecondsToUsable)}s with a ${String(cpuSlowdown)}x slower CPU and a slow network`, async ({
    homePage,
    page,
  }) => {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuSlowdown })
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: latencyMs,
      downloadThroughput: (downloadKbps * 1024) / 8,
      uploadThroughput: (uploadKbps * 1024) / 8,
    })

    const startedAt = Date.now()
    await homePage.goto()
    await expect(homePage.title).toBeVisible({ timeout: maxSecondsToUsable * 1000 })
    await homePage.selectLanguage('English')
    await expect(homePage.tagline).toHaveText('Play the session. Keep the story.', {
      timeout: maxSecondsToUsable * 1000,
    })
    const elapsedSeconds = (Date.now() - startedAt) / 1000

    test
      .info()
      .annotations.push({ type: 'usable after', description: `${elapsedSeconds.toFixed(1)}s` })
    expect(elapsedSeconds).toBeLessThanOrEqual(maxSecondsToUsable)
  })
})
