import { mountPage, pageShell } from './layout'

export function renderPicker() {
  let picking = false

  const shell = pageShell('จับฉลาก', '🎯', `
    <p class="game-hint">ใส่ชื่อหรือรายการทีละบรรทัด แล้วกดสุ่ม — ใครถูกเลือก?</p>
    <textarea class="options-input" id="picker-list" rows="8" placeholder="ชื่อคนที่ 1&#10;ชื่อคนที่ 2&#10;...">เพื่อน A\nเพื่อน B\nเพื่อน C\nเพื่อน D</textarea>
    <div class="picker-display" id="picker-display">
      <span class="picker-placeholder">?</span>
    </div>
    <button class="primary-btn" id="pick-btn">🎯 จับฉลาก!</button>
    <button class="secondary-btn" id="pick-remove" style="display:none">ลบคนที่ถูกเลือกออก</button>
  `)

  mountPage(shell)

  const display = shell.querySelector('#picker-display')!
  const pickBtn = shell.querySelector<HTMLButtonElement>('#pick-btn')!
  const removeBtn = shell.querySelector<HTMLButtonElement>('#pick-remove')!
  const textarea = shell.querySelector<HTMLTextAreaElement>('#picker-list')!
  let lastWinner = ''

  function getList(): string[] {
    return textarea.value.split('\n').map((s) => s.trim()).filter(Boolean)
  }

  pickBtn.addEventListener('click', () => {
    const list = getList()
    if (list.length === 0 || picking) return

    picking = true
    pickBtn.disabled = true
    removeBtn.style.display = 'none'
    display.classList.add('shuffling')

    let ticks = 0
    const maxTicks = 20
    const interval = setInterval(() => {
      const random = list[Math.floor(Math.random() * list.length)]
      display.innerHTML = `<span class="picker-name">${random}</span>`
      ticks++
      if (ticks >= maxTicks) {
        clearInterval(interval)
        lastWinner = list[Math.floor(Math.random() * list.length)]
        display.innerHTML = `<span class="picker-name winner">${lastWinner}</span>`
        display.classList.remove('shuffling')
        display.classList.add('pop')
        setTimeout(() => display.classList.remove('pop'), 400)
        picking = false
        pickBtn.disabled = false
        removeBtn.style.display = 'inline-flex'
      }
    }, 80)
  })

  removeBtn.addEventListener('click', () => {
    const list = getList().filter((name) => name !== lastWinner)
    textarea.value = list.join('\n')
    display.innerHTML = '<span class="picker-placeholder">?</span>'
    removeBtn.style.display = 'none'
    lastWinner = ''
  })
}
