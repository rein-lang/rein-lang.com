import { readFileSync, readdirSync } from 'node:fs'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// The Rein grammar comes from the pinned vscode-rein dependency, so the site highlights like VS Code.
const grammar = JSON.parse(
  readFileSync(new URL('../node_modules/vscode-rein/syntaxes/rein.tmLanguage.json', import.meta.url), 'utf8'),
)
const reinLanguage = { ...grammar, name: 'rein' }

// Links to files of this repo go to GitHub. Links into the Rein source (crates/) and the examples
// (examples/) go to their public repos.
const repoBlob = 'https://github.com/rein-lang/rein-lang.com/blob/main/'
const reinSource = /^(?:\.\.\/)*(crates\/.*)$/
const examplesSource = /^(?:\.\.\/)*examples\/(.*)$/
// VitePress puts `_` before a heading id that starts with a digit, such as `#_11-stepping-agent-interface`.
const siteAnchor = (hash: string) => hash.replace(/^#(?=\d)/, '#_')
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
const specTopics = new Set(readdirSync(new URL('../../language/spec', import.meta.url)))
// Flows live in examples/rein/<flow>/. A link to one flow folder opens its example page.
const flowFolder = /^examples\/rein\/([\w-]+)\/?$/

// Search and social metadata for each page. The canonical URL matches the sitemap and cleanUrls.
const site = 'https://rein-lang.com/'
const docsUrl = `${site}docs/`
const ogImage = `${site}og.png`
const rein = { '@type': 'Organization', name: 'Rein', url: site }
const sections: Record<string, { name: string; url: string }> = {
  examples: { name: 'Examples', url: `${docsUrl}examples/` },
  reference: { name: 'Reference', url: `${docsUrl}reference/spec` },
}

const config = withMermaid(
  defineConfig({
    title: 'Rein',
    description:
      'Rein is a strict, typed language for agent processes. Each step asks the agent a typed question and returns the next instruction. Alpha.',
    base: '/docs/',
    // The host serves `/docs/page` and redirects `/docs/page.html` to it. Link to the final address.
    cleanUrls: true,
    // The landing site lists its own pages. This lists the docs pages, at /docs/sitemap.xml.
    sitemap: { hostname: 'https://rein-lang.com/docs/' },
    // Git dates of each page: the sitemap's lastmod, dateModified in JSON-LD, and the page footer.
    // CI checks out the full history (fetch-depth: 0) so the dates are real.
    lastUpdated: true,
    // Favicons live in landing/public and are served from the site root.
    head: [
      ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
      ['link', { rel: 'icon', href: '/favicon.ico', sizes: '48x48' }],
    ],
    transformHead({ pageData, siteData }) {
      if (pageData.isNotFound) return
      const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
      const url = docsUrl + path
      const title = pageData.title || siteData.title
      const description = pageData.description || siteData.description
      const isIndex = path === ''
      const modified = pageData.lastUpdated ? new Date(pageData.lastUpdated).toISOString() : undefined
      const section = sections[path.split('/')[0]]
      const crumbs = [
        { name: 'Home', url: site },
        { name: 'Docs', url: docsUrl },
        ...(section && section.url !== url ? [section] : []),
        ...(isIndex ? [] : [{ name: title, url }]),
      ]
      const jsonLd = [
        {
          '@context': 'https://schema.org',
          '@type': isIndex ? 'WebPage' : 'TechArticle',
          ...(isIndex ? { name: title } : { headline: title }),
          description,
          url,
          ...(modified ? { dateModified: modified } : {}),
          inLanguage: 'en',
          isPartOf: { '@type': 'WebSite', name: 'Rein', url: site },
          publisher: rein,
          author: rein,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
        },
      ]
      return [
        ['link', { rel: 'canonical', href: url }],
        ['meta', { property: 'og:type', content: isIndex ? 'website' : 'article' }],
        ['meta', { property: 'og:site_name', content: 'Rein' }],
        ['meta', { property: 'og:title', content: title }],
        ['meta', { property: 'og:description', content: description }],
        ['meta', { property: 'og:url', content: url }],
        ...(modified ? [['meta', { property: 'article:modified_time', content: modified }] as [string, Record<string, string>]] : []),
        ['meta', { property: 'og:image', content: ogImage }],
        ['meta', { property: 'og:image:width', content: '1200' }],
        ['meta', { property: 'og:image:height', content: '630' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: title }],
        ['meta', { name: 'twitter:description', content: description }],
        ['meta', { name: 'twitter:image', content: ogImage }],
        ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)],
      ]
    },
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
                child.attrSet('href', `/reference/spec${siteAnchor(href.slice(href.split('#')[0].length))}`)
              } else if (/^docs\//.test(href)) {
                child.attrSet('href', repoBlob + href.replace(/^docs\//, 'language/'))
              } else if (href === 'LICENSE') {
                child.attrSet('href', repoBlob + href)
              } else if (reinSource.test(href)) {
                child.attrSet('href', `https://github.com/rein-lang/rein/blob/main/${reinSource.exec(href)![1]}`)
              } else if (examplesSource.test(href)) {
                child.attrSet('href', `https://github.com/rein-lang/examples/blob/main/${examplesSource.exec(href)![1]}`)
              }
            }
          }
        })
      },
    },
    themeConfig: {
      logo: { src: '/logo.svg', alt: '' },
      nav: [
        { text: 'Getting started', link: '/getting-started' },
        { text: 'Concepts', link: '/concepts' },
        { text: 'Examples', link: '/examples/' },
        { text: 'Reference', link: '/reference/spec' },
        { text: 'Roadmap', link: '/reference/roadmap' },
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
            { text: 'Call another program', link: '/call-programs-by-entry' },
            { text: 'Write faster programs', link: '/write-faster-programs' },
            { text: 'Rein and skills', link: '/rein-vs-skills' },
            { text: 'Progressive disclosure', link: '/progressive-disclosure' },
            { text: 'Why not an existing language', link: '/why-not-a-programming-language' },
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
            { text: 'logo-creation', link: '/examples/logo-creation' },
            { text: 'vscode-extension', link: '/examples/vscode-extension' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Language reference', link: '/reference/spec' },
            { text: 'Decisions and open questions', link: '/reference/decisions' },
            { text: 'Roadmap', link: '/reference/roadmap' },
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
