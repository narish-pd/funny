import type { GameId } from './types'
import { SITE_URL } from './config.ts'

interface PageSEO {
  title: string
  description: string
  path: string
}

export const PAGE_SEO: Record<GameId, PageSEO> = {
  home: {
    title: 'Funny Box — เกมสุ่มและทอยลูกเต๋าออนไลน์ฟรี เล่นกับเพื่อน',
    description:
      'Funny Box รวมเกมฟรีบนมือถือ: ทอยลูกเต๋า 3D, จรเข้อ้าปาก, โยนเหรียญ, หมุนวงล้อ, จับฉลาก, เกมระเบิด — แชร์ลิงก์เล่นกับเพื่อนได้ทันที',
    path: '/',
  },
  dice: {
    title: 'ทอยลูกเต๋า 3D ออนไลน์ | Funny Box',
    description:
      'ทอยลูกเต๋า 1–6 ลูก พร้อมแอนิเมชัน 3D และโหมดถ้วยครอบ เปิดฝาดูผลแบบลุ้น ๆ เล่นฟรีไม่ต้องติดตั้ง',
    path: '/dice',
  },
  crocodile: {
    title: 'เกมจรเข้อ้าปาก ออนไลน์ | Funny Box',
    description:
      'เกมจรเข้อ้าปาก กดฟันทีละซี่ กำหนดจำนวนฟันได้ ใครโดนงับแพ้ เหมาะเล่นกับเพื่อนหลายคน',
    path: '/crocodile',
  },
  coin: {
    title: 'โยนเหรียญ หัวก้อย ออนไลน์ | Funny Box',
    description: 'โยนเหรียญหัวหรือก้อย แอนิเมชัน 3D ตัดสินใจเร็ว ๆ หรือเล่นกับเพื่อน',
    path: '/coin',
  },
  wheel: {
    title: 'หมุนวงล้อสุ่ม ออนไลน์ | Funny Box',
    description: 'ใส่ตัวเลือกแล้วหมุนวงล้อสุ่ม เช่น เลือกเมนูอาหาร กิจกรรม หรือรางวัล — ฟรีบนมือถือ',
    path: '/wheel',
  },
  picker: {
    title: 'จับฉลากสุ่มชื่อ ออนไลน์ | Funny Box',
    description: 'จับฉลากสุ่มชื่อจากลิสต์ เลือกคนทำกิจกรรม แบ่งหน้าที่ หรือลงโทษ — เล่นฟรีกับเพื่อน',
    path: '/picker',
  },
  mines: {
    title: 'เกมระเบิด เปิดทีละช่อง | Funny Box',
    description:
      'เกมระเบิดแบบเปิดทีละช่อง กำหนดจำนวนบล็อกและระเบิดเอง หลีกเลี่ยง 💣 ให้เปิดครบทุกช่องปลอดภัย',
    path: '/mines',
  },
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

export function updateSEO(id: GameId) {
  const seo = PAGE_SEO[id]
  const url = `${SITE_URL}${seo.path === '/' ? '' : seo.path}`

  document.title = seo.title
  setMeta('name', 'description', seo.description)
  setMeta('name', 'twitter:title', seo.title)
  setMeta('name', 'twitter:description', seo.description)
  setMeta('property', 'og:title', seo.title)
  setMeta('property', 'og:description', seo.description)
  setMeta('property', 'og:url', url)
  setCanonical(url)
}
