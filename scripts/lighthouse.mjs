// Runs Lighthouse (mobile, simulated slow device and network) against the production
// build served by `vite preview`, several times, and fails when the median score of a
// category is below the minimum in performance-budget.json. Reports go to lighthouse-report/.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

// Lighthouse looks for an installed Google Chrome; without one, use Playwright's Chromium.
const playwrightChromium = chromium.executablePath()
const chromePath =
  process.env.CHROME_PATH ?? (existsSync(playwrightChromium) ? playwrightChromium : undefined)

const budget = JSON.parse(readFileSync('performance-budget.json', 'utf8'))
const { runs, minScores } = budget.lighthouse
const categories = Object.keys(minScores)
const port = 4174
const url = `http://localhost:${port}/`
const outDir = 'lighthouse-report'

const preview = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--port', String(port), '--strictPort'],
  { stdio: 'ignore' },
)

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Preview server did not start at ${url}`)
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

let failed = false
try {
  await waitForServer()
  mkdirSync(outDir, { recursive: true })

  const results = []
  for (let run = 1; run <= runs; run++) {
    const outputPath = join(outDir, `run-${run}`)
    const lighthouse = spawnSync(
      process.execPath,
      [
        'node_modules/lighthouse/cli/index.js',
        url,
        `--only-categories=${categories.join(',')}`,
        '--output=json',
        '--output=html',
        `--output-path=${outputPath}`,
        '--chrome-flags=--headless=new --no-sandbox',
        '--quiet',
      ],
      {
        stdio: 'inherit',
        env: chromePath ? { ...process.env, CHROME_PATH: chromePath } : process.env,
      },
    )
    if (lighthouse.status !== 0) throw new Error(`Lighthouse run ${run} failed`)

    const report = JSON.parse(readFileSync(`${outputPath}.report.json`, 'utf8'))
    const scores = Object.fromEntries(
      categories.map((category) => [category, Math.round(report.categories[category].score * 100)]),
    )
    console.log(`Run ${run}: ${JSON.stringify(scores)}`)
    results.push({ outputPath, scores })
  }

  // Keep the run with the median score of the first category as the main report
  const [main] = categories
  const medianMain = median(results.map(({ scores }) => scores[main]))
  const representative = results.find(({ scores }) => scores[main] === medianMain)
  renameSync(`${representative.outputPath}.report.html`, join(outDir, 'report.html'))

  for (const category of categories) {
    const score = median(results.map(({ scores }) => scores[category]))
    const ok = score >= minScores[category]
    if (!ok) failed = true
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${category}: ${score} (minimum ${minScores[category]})`)
  }
} finally {
  preview.kill()
}

if (failed) process.exit(1)
