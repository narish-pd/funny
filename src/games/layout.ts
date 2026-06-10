import { navigate } from '../main'

export function pageShell(title: string, emoji: string, content: string): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'page game-page'
  wrapper.innerHTML = `
    <header class="game-header">
      <button class="back-btn" aria-label="กลับหน้าหลัก">← กลับ</button>
      <h1><span class="header-emoji">${emoji}</span> ${title}</h1>
    </header>
    <main class="game-content">${content}</main>
  `
  wrapper.querySelector('.back-btn')!.addEventListener('click', () => navigate('home'))
  return wrapper
}

export function mountPage(el: HTMLElement) {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = ''
  app.appendChild(el)
}
