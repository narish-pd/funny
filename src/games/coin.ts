import { mountPage, pageShell } from './layout'

export function renderCoin() {
  let flipping = false

  const shell = pageShell('โยนเหรียญ', '🪙', `
    <div class="coin-scene">
      <div class="coin" id="coin">
        <div class="coin-face heads">หัว</div>
        <div class="coin-face tails">ก้อย</div>
      </div>
    </div>
    <div class="coin-result" id="coin-result">กดปุ่มเพื่อโยนเหรียญ</div>
    <button class="primary-btn" id="flip-btn">🪙 โยน!</button>
  `)

  mountPage(shell)

  const coin = shell.querySelector('#coin')!
  const resultEl = shell.querySelector('#coin-result')!
  const flipBtn = shell.querySelector<HTMLButtonElement>('#flip-btn')!

  flipBtn.addEventListener('click', () => {
    if (flipping) return
    flipping = true
    flipBtn.disabled = true
    resultEl.textContent = 'กำลังโยน...'
    coin.classList.remove('show-heads', 'show-tails')
    coin.classList.add('flipping')

    const outcome: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails'

    setTimeout(() => {
      coin.classList.remove('flipping')
      coin.classList.add(outcome === 'heads' ? 'show-heads' : 'show-tails')
      resultEl.innerHTML = outcome === 'heads'
        ? '<strong>หัว!</strong> 🦅'
        : '<strong>ก้อย!</strong> 🌿'
      flipping = false
      flipBtn.disabled = false
      resultEl.classList.add('pop')
      setTimeout(() => resultEl.classList.remove('pop'), 400)
    }, 1200)
  })
}
