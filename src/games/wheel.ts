import { mountPage, pageShell } from './layout'

const DEFAULT_OPTIONS = ['พิซซ่า', 'ส้มตำ', 'ข้าวมันไก่', 'ชาบู', 'ก๋วยเตี๋ยว', 'เบอร์เกอร์']

export function renderWheel() {
  let options = [...DEFAULT_OPTIONS]
  let spinning = false
  let rotation = 0

  const shell = pageShell('หมุนวงล้อ', '🎡', `
    <p class="game-hint">ใส่ตัวเลือกทีละบรรทัด แล้วกดหมุน — เหมาะตัดสินใจว่ากินอะไร!</p>
    <textarea class="options-input" id="wheel-options" rows="6" placeholder="ตัวเลือกแต่ละบรรทัด...">${options.join('\n')}</textarea>
    <div class="wheel-wrap">
      <div class="wheel-pointer">▼</div>
      <canvas id="wheel-canvas" width="320" height="320"></canvas>
    </div>
    <div class="wheel-result" id="wheel-result">พร้อมหมุน!</div>
    <button class="primary-btn" id="spin-btn">🎡 หมุน!</button>
  `)

  mountPage(shell)

  const canvas = shell.querySelector<HTMLCanvasElement>('#wheel-canvas')!
  const ctx = canvas.getContext('2d')!
  const resultEl = shell.querySelector('#wheel-result')!
  const spinBtn = shell.querySelector<HTMLButtonElement>('#spin-btn')!
  const textarea = shell.querySelector<HTMLTextAreaElement>('#wheel-options')!

  const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#F472B6', '#34D399', '#60A5FA', '#FB923C']

  function getOptions(): string[] {
    return textarea.value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  function drawWheel(angle = 0) {
    const opts = getOptions()
    if (opts.length === 0) {
      ctx.clearRect(0, 0, 320, 320)
      ctx.fillStyle = '#334155'
      ctx.beginPath()
      ctx.arc(160, 160, 150, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px Kanit, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('ใส่ตัวเลือกก่อน', 160, 165)
      return
    }

    const slice = (Math.PI * 2) / opts.length
    ctx.clearRect(0, 0, 320, 320)
    ctx.save()
    ctx.translate(160, 160)
    ctx.rotate(angle)

    opts.forEach((label, i) => {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, 150, i * slice, (i + 1) * slice)
      ctx.closePath()
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.save()
      ctx.rotate(i * slice + slice / 2)
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 14px Kanit, sans-serif'
      ctx.textAlign = 'right'
      const text = label.length > 10 ? label.slice(0, 9) + '…' : label
      ctx.fillText(text, 130, 5)
      ctx.restore()
    })

    ctx.beginPath()
    ctx.arc(0, 0, 20, 0, Math.PI * 2)
    ctx.fillStyle = '#1e293b'
    ctx.fill()
    ctx.restore()
  }

  textarea.addEventListener('input', () => {
    if (!spinning) drawWheel(rotation)
  })

  spinBtn.addEventListener('click', () => {
    const opts = getOptions()
    if (opts.length < 2 || spinning) return

    spinning = true
    spinBtn.disabled = true
    resultEl.textContent = 'กำลังหมุน...'

    const winnerIndex = Math.floor(Math.random() * opts.length)
    const slice = (Math.PI * 2) / opts.length
    const extra = Math.PI * 2 * (4 + Math.floor(Math.random() * 3))
    const target = extra + (Math.PI * 1.5 - (winnerIndex + 0.5) * slice)

    const start = rotation
    const delta = target - (start % (Math.PI * 2)) + Math.PI * 2 * 3
    const duration = 4000
    const startTime = performance.now()

    function animate(now: number) {
      const t = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      rotation = start + delta * ease
      drawWheel(rotation)
      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        spinning = false
        spinBtn.disabled = false
        resultEl.innerHTML = `ได้: <strong>${opts[winnerIndex]}</strong> 🎉`
        resultEl.classList.add('pop')
        setTimeout(() => resultEl.classList.remove('pop'), 400)
      }
    }
    requestAnimationFrame(animate)
  })

  drawWheel()
}
