const DISMISS_SESSION_KEY = 'funny-box-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function setupInstallPrompt() {
  if (isInstalled() || sessionStorage.getItem(DISMISS_SESSION_KEY)) return

  let deferred: BeforeInstallPromptEvent | null = null
  let banner: HTMLElement | null = null
  let showTimer: ReturnType<typeof setTimeout> | null = null

  function hideBanner() {
    banner?.remove()
    banner = null
  }

  function showBanner() {
    if (banner || !deferred) return

    banner = document.createElement('aside')
    banner.className = 'install-sheet'
    banner.setAttribute('role', 'dialog')
    banner.setAttribute('aria-label', 'เพิ่ม Funny Box ไปหน้าจอหลัก')
    banner.innerHTML = `
      <div class="install-sheet-card">
        <div class="install-sheet-header">
          <img class="install-app-icon" src="/icon192.png" width="52" height="52" alt="" />
          <div class="install-app-info">
            <p class="install-app-name">Funny Box</p>
            <p class="install-app-tagline">เกมทอยลูกเต๋า · หมุนวงล้อ · จับฉลาก</p>
          </div>
        </div>
        <p class="install-app-desc">เพิ่มไปหน้าจอหลักเพื่อเปิดได้เร็วขึ้น ใช้งานฟรี ไม่ต้องสมัครสมาชิก</p>
        <div class="install-sheet-actions">
          <button type="button" class="install-btn-secondary">ไม่ใช่ตอนนี้</button>
          <button type="button" class="install-btn-primary">เพิ่มที่หน้าจอหลัก</button>
        </div>
      </div>
    `

    banner.querySelector('.install-btn-primary')!.addEventListener('click', async () => {
      if (!deferred) return
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      deferred = null
      hideBanner()
      if (outcome === 'dismissed') sessionStorage.setItem(DISMISS_SESSION_KEY, '1')
    })

    banner.querySelector('.install-btn-secondary')!.addEventListener('click', () => {
      sessionStorage.setItem(DISMISS_SESSION_KEY, '1')
      hideBanner()
    })

    document.body.appendChild(banner)
    requestAnimationFrame(() => banner!.classList.add('is-visible'))
  }

  function scheduleShow() {
    if (showTimer) return
    showTimer = setTimeout(() => {
      showTimer = null
      showBanner()
    }, 1500)
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    scheduleShow()
  })

  window.addEventListener('appinstalled', () => {
    if (showTimer) clearTimeout(showTimer)
    deferred = null
    hideBanner()
  })
}
