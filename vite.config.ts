import { defineConfig, loadEnv } from 'vite'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'

const ROUTES = ['', '/dice', '/crocodile', '/coin', '/wheel', '/picker', '/mines']

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'https://funny.narishdev.workers.dev').replace(/\/$/, '')

  return {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icon192.png', 'icon512.png', 'og-image.svg'],
        manifest: {
          name: 'Funny Box — เล่นสนุกกับเพื่อน',
          short_name: 'Funny Box',
          description:
            'เกมสุ่มและทอยลูกเต๋าออนไลน์ฟรี: ทอยลูกเต๋า 3D, จรเข้อ้าปาก, หมุนวงล้อ, จับฉลาก, เกมระเบิด',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          lang: 'th',
          categories: ['games', 'entertainment'],
          icons: [
            {
              src: '/icon192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icon512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icon512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,txt,xml,webmanifest}'],
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 8, maxAgeSeconds: 365 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
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
