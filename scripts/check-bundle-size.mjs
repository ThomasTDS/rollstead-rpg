// Fails when the initial bundle (every script and stylesheet index.html loads up front,
// gzip-compressed) exceeds the budget in performance-budget.json. Lazy chunks, such as
// the translation files, are not part of the initial bundle.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const budget = JSON.parse(readFileSync('performance-budget.json', 'utf8'))
const html = readFileSync(join('dist', 'index.html'), 'utf8')

const initialAssets = [
  ...html.matchAll(/<script[^>]+src="\/([^"]+)"/g),
  ...html.matchAll(/<link[^>]+rel="(?:stylesheet|modulepreload)"[^>]+href="\/([^"]+)"/g),
].map(([, path]) => path)

if (initialAssets.length === 0) {
  console.error('No initial assets found in dist/index.html. Run "npm run build" first.')
  process.exit(1)
}

const sizes = initialAssets.map((path) => ({
  path,
  gzipKb: gzipSync(readFileSync(join('dist', path)), { level: 9 }).length / 1024,
}))
const totalKb = sizes.reduce((sum, { gzipKb }) => sum + gzipKb, 0)

for (const { path, gzipKb } of sizes) console.log(`${gzipKb.toFixed(1).padStart(8)} KB  ${path}`)
console.log(
  `${totalKb.toFixed(1).padStart(8)} KB  total (gzip), budget ${budget.initialBundleKb} KB`,
)

if (totalKb > budget.initialBundleKb) {
  const overKb = (totalKb - budget.initialBundleKb).toFixed(1)
  console.error(`Initial bundle is over budget by ${overKb} KB.`)
  process.exit(1)
}
