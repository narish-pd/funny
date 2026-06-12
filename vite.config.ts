import { defineConfig, loadEnv } from 'vite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROUTES = ['', '/dice', '/crocodile', '/coin', '/wheel', '/picker', '/mines']

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'https://funny.narishdev.workers.dev').replace(/\/$/, '')

  return {
    plugins: [
      {
        name: 'seo-build',
        transformIndexHtml(html: string) {
          return html.replaceAll('__SITE_URL__', siteUrl)
        },
        closeBundle() {
          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((route) => {
  const loc = route ? `${siteUrl}${route}` : `${siteUrl}/`
  const priority = route ? '0.8' : '1.0'
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}).join('\n')}
</urlset>`
          writeFileSync(resolve('dist/sitemap.xml'), sitemap, 'utf-8')
          writeFileSync(
            resolve('dist/robots.txt'),
            `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
            'utf-8',
          )
        },
      },
    ],
  }
})
