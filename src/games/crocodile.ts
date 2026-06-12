import { mountPage, pageShell } from './layout'

const MIN_TEETH = 4
const MAX_TEETH = 20
const DEFAULT_TEETH = 10

export function renderCrocodile() {
  let toothCount = DEFAULT_TEETH
  let badTooth = -1
  let snapped = false
  let pressed: Set<number> = new Set()
  let players = 2

  function canChangeSettings() {
    return !snapped && pressed.size === 0
  }

  function reset() {
    badTooth = Math.floor(Math.random() * toothCount)
    snapped = false
    pressed = new Set()
    paint()
  }

  function setToothCount(n: number) {
    if (!canChangeSettings()) return
    toothCount = Math.min(MAX_TEETH, Math.max(MIN_TEETH, n))
    shell.querySelector('#tooth-count')!.textContent = String(toothCount)
    shell.querySelectorAll<HTMLButtonElement>('.tooth-count-btn').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.count) === toothCount)
    })
    reset()
  }

  function paintUpperTeeth() {
    const upper = shell.querySelector('#teeth-upper')!
    upper.innerHTML = Array.from({ length: toothCount }, (_, i) => `
      <span class="tooth-static">
        <span class="tooth-num">${i + 1}</span>
      </span>
    `).join('')
  }

  function paint() {
    const status = shell.querySelector('#croc-status')!
    const jaw = shell.querySelector<HTMLElement>('#croc-jaw')!
    const teethRow = shell.querySelector('#teeth-row')!
    const resetBtn = shell.querySelector<HTMLButtonElement>('#croc-reset')!
    const settingsLocked = !canChangeSettings()

    jaw.dataset.teeth = String(toothCount)
    jaw.style.setProperty('--tooth-count', String(toothCount))
    shell.querySelector('#tooth-minus')!.toggleAttribute('disabled', settingsLocked || toothCount <= MIN_TEETH)
    shell.querySelector('#tooth-plus')!.toggleAttribute('disabled', settingsLocked || toothCount >= MAX_TEETH)
    shell.querySelectorAll<HTMLButtonElement>('.tooth-count-btn').forEach((btn) => {
      btn.disabled = settingsLocked
    })

    paintUpperTeeth()
    jaw.classList.toggle('snapped', snapped)

    if (snapped) {
      status.innerHTML = `<span class="status-bad">🦷 ฟันซี่ที่ <strong>${badTooth + 1}</strong> งับ! คนที่กดแพ้ 😱</span>`
      resetBtn.style.display = 'inline-flex'
    } else if (pressed.size === 0) {
      status.innerHTML = `<span class="status-ok">กดฟันทีละซี่ (1–${toothCount}) ระวังจรเข้จะงับ!</span>`
      resetBtn.style.display = 'none'
    } else {
      status.innerHTML = `<span class="status-ok">กดไปแล้ว ${pressed.size}/${toothCount} ซี่ — ยังปลอดภัย...</span>`
      resetBtn.style.display = 'none'
    }

    teethRow.innerHTML = Array.from({ length: toothCount }, (_, i) => {
      const isPressed = pressed.has(i)
      const disabled = snapped || isPressed
      return `
        <button
          class="tooth ${isPressed ? 'pressed' : ''}"
          data-tooth="${i}"
          ${disabled ? 'disabled' : ''}
          aria-label="ฟันซี่ที่ ${i + 1}"
        >
          <span class="tooth-top">
            <span class="tooth-num">${i + 1}</span>
          </span>
          <span class="tooth-body"></span>
        </button>
      `
    }).join('')

    teethRow.querySelectorAll<HTMLButtonElement>('.tooth').forEach((btn) => {
      if (!btn.disabled) {
        btn.addEventListener('click', () => onToothClick(Number(btn.dataset.tooth)))
      }
    })
  }

  function onToothClick(index: number) {
    if (snapped || pressed.has(index)) return
    pressed.add(index)

    if (index === badTooth) {
      snapped = true
      shell.querySelector('#croc-jaw')!.classList.add('shake')
      setTimeout(() => shell.querySelector('#croc-jaw')!.classList.remove('shake'), 500)
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 120
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      } catch { /* audio optional */ }
    }
    paint()
  }

  const shell = pageShell('จรเข้อ้าปาก', '🐊', `
    <p class="game-hint">ผลัดกันกดฟัน — ใครโดนงับแพ้! เหมาะเล่น ${players} คนขึ้นไป</p>
    <div class="croc-settings">
      <div class="setting-group">
        <label>จำนวนฟัน (${MIN_TEETH}–${MAX_TEETH} ซี่)</label>
        <div class="stepper">
          <button id="tooth-minus" type="button">−</button>
          <span id="tooth-count">${toothCount}</span>
          <button id="tooth-plus" type="button">+</button>
        </div>
        <div class="tooth-count-presets">
          ${[6, 8, 10, 12, 15, 20].map(
            (n) => `<button type="button" class="tooth-count-btn ${n === toothCount ? 'active' : ''}" data-count="${n}">${n}</button>`,
          ).join('')}
        </div>
      </div>
    </div>
    <div class="croc-scene">
      <div class="croc-head" id="croc-jaw" data-teeth="${toothCount}">
        <div class="croc-upper">
          <div class="croc-eye left"></div>
          <div class="croc-eye right"></div>
          <div class="croc-nostril left"></div>
          <div class="croc-nostril right"></div>
        </div>
        <div class="teeth-row upper" id="teeth-upper"></div>
        <div class="teeth-row interactive" id="teeth-row"></div>
        <div class="croc-lower"></div>
      </div>
    </div>
    <div class="croc-status" id="croc-status"></div>
    <button class="primary-btn" id="croc-reset" style="display:none">🔄 เล่นใหม่</button>
    <button class="secondary-btn" id="croc-new-game">เริ่มเกมใหม่</button>
  `)

  mountPage(shell)

  shell.querySelector('#tooth-minus')!.addEventListener('click', () => setToothCount(toothCount - 1))
  shell.querySelector('#tooth-plus')!.addEventListener('click', () => setToothCount(toothCount + 1))
  shell.querySelectorAll<HTMLButtonElement>('.tooth-count-btn').forEach((btn) => {
    btn.addEventListener('click', () => setToothCount(Number(btn.dataset.count)))
  })

  shell.querySelector('#croc-reset')!.addEventListener('click', reset)
  shell.querySelector('#croc-new-game')!.addEventListener('click', reset)

  reset()
}
