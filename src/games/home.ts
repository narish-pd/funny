import { navigate } from '../main'

const GAMES = [
  { id: 'dice' as const, emoji: '🎲', title: 'ทอยลูกเต๋า', desc: 'เลือกจำนวนลูก แล้วทอยพร้อมแอนิเมชัน' },
  { id: 'crocodile' as const, emoji: '🐊', title: 'จรเข้อ้าปาก', desc: 'กดฟันทีละซี่ ใครโดนงับแพ้!' },
  { id: 'coin' as const, emoji: '🪙', title: 'โยนเหรียญ', desc: 'หัวหรือก้อย ตัดสินใจให้เร็วขึ้น' },
  { id: 'wheel' as const, emoji: '🎡', title: 'หมุนวงล้อ', desc: 'ใส่ตัวเลือกแล้วให้วงล้อตัดสิน' },
  { id: 'picker' as const, emoji: '🎯', title: 'จับฉลาก', desc: 'สุ่มชื่อคนหรือรายการจากลิสต์' },
]

export function renderHome() {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="page home">
      <header class="hero-header">
        <div class="hero-badge">🎉 เล่นกับเพื่อน</div>
        <h1>Funny Box</h1>
        <p class="subtitle">กล่องเครื่องมือสุ่มและเกมสนุก ๆ ในที่เดียว</p>
      </header>
      <div class="game-grid">
        ${GAMES.map(
          (g) => `
          <button class="game-card" data-game="${g.id}">
            <span class="game-emoji">${g.emoji}</span>
            <span class="game-title">${g.title}</span>
            <span class="game-desc">${g.desc}</span>
          </button>
        `,
        ).join('')}
      </div>
      <footer class="footer-note">เปิดบนมือถือแล้วแชร์ลิงก์ให้เพื่อนได้เลย 📱</footer>
    </div>
  `

  app.querySelectorAll<HTMLButtonElement>('.game-card').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.game as typeof GAMES[number]['id']))
  })
}
