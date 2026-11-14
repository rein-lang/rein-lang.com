import { readFileSync, readdirSync } from 'node:fs'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// The Rein grammar comes from the pinned vscode-rein dependency, so the site highlights like VS Code.
const grammar = JSON.parse(
  readFileSync(new URL('../node_modules/vscode-rein/syntaxes/rein.tmLanguage.json', import.meta.url), 'utf8'),
)
const reinLanguage = { ...grammar, name: 'rein' }

// Included repo files link to sources outside the site. Send those links to GitHub.
const repoBlob = 'https://github.com/tupe12334/rein/blob/main/'
const siteLinks: Record<string, string> = {
  'docs/spec.md': '/reference/spec',
  'docs/decisions.md': '/reference/decisions',
  'docs/interface.md': '/reference/interface',
  'docs/install-programs.md': '/install-programs',
  '../decisions.md': '/reference/decisions',
  '../interface.md': '/reference/interface',
  '../install-programs.md': '/install-programs',
}
// The spec is one page on the site: its topic files (docs/spec/) are included into it.
const specTopics = new Set(readdirSync(new URL('../../../docs/spec', import.meta.url)))
// Flows live in examples/rein/<flow>/. A link to one flow folder opens its example page.
const flowFolder = /^examples\/rein\/([\w-]+)\/?$/

const config = withMermaid(
  defineConfig({
    title: 'Rein',
    description: 'A strict TypeScript-like language for agent decision flows.',
    base: '/docs/',
    markdown: {
      html: false,
      languages: [reinLanguage],
      config(md) {
        md.core.ruler.push('repo-links', (state) => {
          for (const block of state.tokens) {
            for (const child of block.children ?? []) {
              if (child.type !== 'link_open') continue
              const href = child.attrGet('href') ?? ''
              const flow = flowFolder.exec(href)
              if (href in siteLinks) {
                child.attrSet('href', siteLinks[href])
              } else if (flow) {
                child.attrSet('href', `/examples/${flow[1]}`)
              } else if (specTopics.has(href.split('#')[0].replace(/^spec\//, ''))) {
                child.attrSet('href', `/reference/spec${href.slice(href.split('#')[0].length)}`)
              } else if (/^((docs|examples|crates)\/|LICENSE$)/.test(href)) {
                child.attrSet('href', repoBlob + href)
              }
            }
          }
        })
      },
    },
    themeConfig: {
      nav: [
        { text: 'Getting started', link: '/getting-started' },
        { text: 'Concepts', link: '/concepts' },
        { text: 'Examples', link: '/examples/' },
        { text: 'Reference', link: '/reference/spec' },
        { text: 'Alpha', link: '/reference/decisions' },
      ],
      sidebar: [
        {
          text: 'Start',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Getting started', link: '/getting-started' },
            { text: 'Install a program', link: '/install-programs' },
            { text: 'Concepts', link: '/concepts' },
            { text: 'Editor', link: '/editor' },
          ],
        },
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'merge-pr', link: '/examples/merge-pr' },
            { text: 'incident-triage', link: '/examples/incident-triage' },
            { text: 'support-ticket', link: '/examples/support-ticket' },
            { text: 'pr-handling', link: '/examples/pr-handling' },
            { text: 'priority-work', link: '/examples/priority-work' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Language reference', link: '/reference/spec' },
            { text: 'Decisions and open questions', link: '/reference/decisions' },
            { text: 'Agent interface', link: '/reference/interface' },
            { text: 'CLI reference', link: '/reference/cli' },
            { text: 'CLI: run and step', link: '/reference/cli-run' },
            { text: 'CLI: graph and debug', link: '/reference/cli-inspect' },
            { text: 'CLI: programs', link: '/reference/cli-programs' },
            { text: 'CLI: agents and servers', link: '/reference/cli-agents' },
          ],
        },
      ],
      search: { provider: 'local' },
    },
  }),
)

// vitepress-plugin-mermaid pre-bundles `debug`, but mermaid 11 does not install it.
const optimizeDeps = config.vite!.optimizeDeps!
// Pre-bundle mermaid itself. The plugin lists only some of its deps, and newer mermaid
// imports CommonJS ones (fastdom) that crash in the browser unless Vite bundles them.
optimizeDeps.include = [...optimizeDeps.include!.filter((dep) => dep !== 'debug'), 'mermaid']

export default config
