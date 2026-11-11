import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// The Rein grammar is the editor's grammar, so the site and VS Code highlight the same way.
const grammar = JSON.parse(
  readFileSync(new URL('../../../editors/vscode/syntaxes/rein.tmLanguage.json', import.meta.url), 'utf8'),
)
const reinLanguage = { ...grammar, name: 'rein' }

// Included repo files link to sources outside the site. Send those links to GitHub.
const repoBlob = 'https://github.com/tupe12334/rein/blob/main/'
const siteLinks: Record<string, string> = {
  'docs/spec.md': '/reference/spec',
  'docs/decisions.md': '/reference/decisions',
  'docs/interface.md': '/reference/interface',
}
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
              } else if (/^((docs|examples|editors|crates)\/|LICENSE$)/.test(href)) {
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
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Language reference', link: '/reference/spec' },
            { text: 'Decisions and open questions', link: '/reference/decisions' },
            { text: 'Agent interface', link: '/reference/interface' },
            { text: 'CLI reference', link: '/reference/cli' },
          ],
        },
      ],
      search: { provider: 'local' },
    },
  }),
)

// vitepress-plugin-mermaid pre-bundles `debug`, but mermaid 11 does not install it.
const optimizeDeps = config.vite!.optimizeDeps!
optimizeDeps.include = optimizeDeps.include!.filter((dep) => dep !== 'debug')

export default config
