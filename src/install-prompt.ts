const DISMISS_KEY = 'funny-box-install-dismissed'

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
  if (isInstalled() || localStorage.getItem(DISMISS_KEY)) return

  let deferred: BeforeInstallPromptEvent | null = null
  let banner: HTMLElement | null = null

  function hideBanner() {
    banner?.remove()
    banner = null
  }

  function showBanner() {
    if (banner || !deferred) return

    banner = document.createElement('div')
    banner.className = 'install-banner'
    banner.innerHTML = `
      <div class="install-banner-text">
        <strong>📲 ติดตั้ง Funny Box</strong>
        <span>เพิ่มไปหน้าจอหลัก เล่นได้เหมือนแอป</span>
      </div>
      <div class="install-banner-actions">
        <button type="button" class="install-btn">ติดตั้ง</button>
        <button type="button" class="install-dismiss" aria-label="ปิด">✕</button>
      </div>
    `

    banner.querySelector('.install-btn')!.addEventListener('click', async () => {
      if (!deferred) return
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      deferred = null
      hideBanner()
      if (outcome === 'dismissed') localStorage.setItem(DISMISS_KEY, '1')
    })

    banner.querySelector('.install-dismiss')!.addEventListener('click', () => {
      localStorage.setItem(DISMISS_KEY, '1')
      hideBanner()
    })

    document.body.appendChild(banner)
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    showBanner()
  })

  window.addEventListener('appinstalled', () => {
    deferred = null
    hideBanner()
  })
}
