// Generate website/docs/examples/*.md from the programs in examples/rein/<name>/ (each has a rein.json).
// Run `node website/docs/scripts/generate-examples.mjs`. Pass `--check` to fail, without writing,
// when a page, the overview, or the sidebar in .vitepress/config.mts differs from the examples.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const docs = join(dirname(fileURLToPath(import.meta.url)), '..')
const programs = join(docs, '../../examples/rein')
const outDir = join(docs, 'examples')
const configPath = join(docs, '.vitepress/config.mts')
const check = process.argv.includes('--check')

const examples = readdirSync(programs).filter((n) => existsSync(join(programs, n, 'rein.json'))).sort()

function manifest(name) {
  const m = JSON.parse(readFileSync(join(programs, name, 'rein.json'), 'utf8'))
  if (m.name !== name) throw new Error(`${name}/rein.json names "${m.name}"; the folder and name must match`)
  return m
}

function reinFiles(name) {
  return readdirSync(join(programs, name), { recursive: true })
    .map((p) => p.split(sep).join('/'))
    .filter((p) => p.endsWith('.rein'))
    .sort()
}

function examplePage(name) {
  const m = manifest(name)
  const readme = readFileSync(join(programs, name, 'README.md'), 'utf8')
  if (!readme.startsWith(`# ${name}\n`)) throw new Error(`${name}/README.md must start with "# ${name}"`)
  const files = reinFiles(name)
  if (!files.includes(m.entry)) throw new Error(`${name}/rein.json entry "${m.entry}" is not a .rein file`)
  const base = `../../../examples/rein/${name}`
  let out = `---\ndescription: ${JSON.stringify(m.description)}\n---\n\n`
  out += `<!--@include: ${base}/README.md-->\n\n## Source\n\n`
  out += `### \`rein.json\`\n\n<<< ${base}/rein.json{json}\n`
  // The entry file comes first, then the rest in path order.
  for (const f of [m.entry, ...files.filter((f) => f !== m.entry)]) {
    out += `\n### \`${f}\`\n\n<<< ${base}/${f}{rein}\n`
  }
  return out
}

function overviewPage() {
  let out = '# Examples\n\n'
  out += 'Each example is a flow under `examples/rein/<flow>/`, with a `rein.json` manifest. Open one to read its files and run it.\n\n'
  for (const n of examples) out += `- [${n}](/examples/${n}): ${manifest(n).description}\n`
  out += '\nRun `rein list` from the `examples` folder to list them. Then run one by name. See [flows and scopes](docs/spec.md#1a-flows-and-scopes):\n\n'
  out += '```sh\ncd examples\nrein list\nrein run support-ticket\n```\n'
  return out
}

const pages = new Map([['index.md', overviewPage()], ...examples.map((n) => [`${n}.md`, examplePage(n)])])

// The sidebar links every example page, and no other example page.
const sidebar = [...readFileSync(configPath, 'utf8').matchAll(/link: '\/examples\/([\w-]+)'/g)].map((m) => m[1])
const sidebarProblems = []
for (const n of examples) if (sidebar.filter((s) => s === n).length !== 1) sidebarProblems.push(`sidebar must list ${n} once`)
for (const s of sidebar) if (!examples.includes(s)) sidebarProblems.push(`sidebar links ${s}, which is not an example`)

const stale = existsSync(outDir)
  ? readdirSync(outDir).filter((f) => f.endsWith('.md') && !pages.has(f))
  : []

if (!check) {
  mkdirSync(outDir, { recursive: true })
  for (const [file, text] of pages) writeFileSync(join(outDir, file), text)
  for (const f of stale) rmSync(join(outDir, f))
  console.log(`wrote ${pages.size} example pages to ${outDir}`)
  if (sidebarProblems.length) console.error(sidebarProblems.join('\n'))
  process.exit(sidebarProblems.length ? 1 : 0)
}

const problems = [...sidebarProblems]
for (const f of stale) problems.push(`${f} has no example; delete it`)
for (const [file, text] of pages) {
  const path = join(outDir, file)
  const onDisk = existsSync(path) ? readFileSync(path, 'utf8') : null
  if (onDisk === null) problems.push(`${file} is missing`)
  else if (onDisk !== text) problems.push(`${file} differs from its example`)
}
if (problems.length) {
  console.error(problems.join('\n'))
  console.error('Run `node website/docs/scripts/generate-examples.mjs` and review the diff.')
  process.exit(1)
}
console.log('Example pages are up to date.')
