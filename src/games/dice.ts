import { mountPage, pageShell } from './layout'

const DEFAULT_VALUE = 4

const DOTS: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
}

const FACE_ROTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
}

function rotationString(x: number, y: number) {
  return `rotateX(${x}deg) rotateY(${y}deg)`
}

function faceDots(value: number): string {
  return DOTS[value]
    .map(([r, c]) => `<span class="dot" style="grid-row:${r + 1};grid-column:${c + 1}"></span>`)
    .join('')
}

function applyCubeValue(cube: HTMLElement, value: number) {
  const rot = FACE_ROTATION[value]
  cube.style.transform = rotationString(rot.x, rot.y)
  cube.dataset.value = String(value)
  cube.setAttribute('aria-label', `ลูกเต๋า ${value}`)
}

function createDiceCube(value: number): HTMLDivElement {
  const scene = document.createElement('div')
  scene.className = 'dice-scene'

  const cube = document.createElement('div')
  cube.className = 'dice-cube'

  for (let v = 1; v <= 6; v++) {
    const face = document.createElement('div')
    face.className = `dice-face face-${v}`
    face.innerHTML = faceDots(v)
    cube.appendChild(face)
  }

  applyCubeValue(cube, value)
  scene.appendChild(cube)
  return scene
}

function getSpinRotation(value: number): { x: number; y: number } {
  const base = FACE_ROTATION[value]
  const spinX = (3 + Math.floor(Math.random() * 3)) * 360
  const spinY = (3 + Math.floor(Math.random() * 3)) * 360
  return { x: base.x + spinX, y: base.y + spinY }
}

function animateDiceRoll(cube: HTMLElement, finalValue: number): Promise<void> {
  cube.getAnimations().forEach((a) => a.cancel())

  const currentValue = Number(cube.dataset.value) || DEFAULT_VALUE
  const from = FACE_ROTATION[currentValue]
  const to = getSpinRotation(finalValue)

  return new Promise((resolve) => {
    const anim = cube.animate(
      [
        { transform: rotationString(from.x, from.y) },
        { transform: rotationString(to.x, to.y) },
      ],
      {
        duration: 3000 + Math.random() * 750,
        easing: 'cubic-bezier(0.15, 0.85, 0.25, 1)',
        fill: 'forwards',
      },
    )
    anim.onfinish = () => {
      anim.cancel()
      applyCubeValue(cube, finalValue)
      resolve()
    }
  })
}

function sumValues(vals: number[]) {
  return vals.reduce((a, b) => a + b, 0)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function renderDice() {
  let count = 2
  let rolling = false
  let cupMode = false
  let awaitingReveal = false
  let values: number[] = [DEFAULT_VALUE, DEFAULT_VALUE]
  const cubes: HTMLDivElement[] = []

  const shell = pageShell('ทอยลูกเต๋า', '🎲', `
    <div class="dice-controls">
      <label>จำนวนลูกเต๋า</label>
      <div class="count-picker">
        ${[1, 2, 3, 4, 5, 6].map((n) => `<button class="count-btn ${n === count ? 'active' : ''}" data-count="${n}">${n}</button>`).join('')}
      </div>
    </div>
    <div class="dice-options">
      <label class="toggle-option">
        <input type="checkbox" id="cup-mode-toggle" />
        <span class="toggle-track" aria-hidden="true"><span class="toggle-thumb"></span></span>
        <span class="toggle-label">โหมดถ้วยครอบ 🥤</span>
      </label>
      <p class="option-hint" id="cup-hint">ปิด — เห็นลูกเต๋าหมุนตามปกติ</p>
    </div>
    <div class="dice-cup-arena" id="dice-cup-arena">
      <div class="dice-cup-rim" aria-hidden="true"></div>
      <div class="dice-area" id="dice-area"></div>
      <div class="dice-cup-lid" id="dice-cup-lid" aria-hidden="true">
        <div class="lid-dome"></div>
        <div class="lid-knob"></div>
      </div>
    </div>
    <div class="dice-result" id="dice-result">รวม: <strong>${DEFAULT_VALUE * count}</strong></div>
    <div class="dice-actions">
      <button class="primary-btn roll-btn" id="roll-btn">🎲 ทอย!</button>
      <button class="primary-btn reveal-btn" id="reveal-btn" style="display:none">🫳 เปิดฝา</button>
    </div>
  `)

  mountPage(shell)

  const arena = shell.querySelector<HTMLElement>('#dice-cup-arena')!
  const area = shell.querySelector('#dice-area')!
  const lid = shell.querySelector('#dice-cup-lid')!
  const resultEl = shell.querySelector('#dice-result strong')!
  const resultWrap = shell.querySelector('#dice-result')!
  const rollBtn = shell.querySelector<HTMLButtonElement>('#roll-btn')!
  const revealBtn = shell.querySelector<HTMLButtonElement>('#reveal-btn')!
  const cupToggle = shell.querySelector<HTMLInputElement>('#cup-mode-toggle')!
  const cupHint = shell.querySelector('#cup-hint')!

  function updateResult(hidden = false) {
    resultEl.textContent = hidden ? '?' : String(sumValues(values))
  }

  function setLidClosed(closed: boolean) {
    lid.classList.toggle('is-closed', closed)
    arena.classList.toggle('lid-closed', closed)
  }

  function openLid() {
    setLidClosed(false)
    arena.classList.add('lid-opening')
    setTimeout(() => arena.classList.remove('lid-opening'), 600)
  }

  async function closeLid() {
    arena.classList.add('lid-closing')
    setLidClosed(true)
    await delay(350)
    arena.classList.remove('lid-closing')
  }

  function updateCupUI() {
    arena.classList.toggle('cup-mode', cupMode)
    cupHint.textContent = cupMode
      ? 'เปิด — ทอยแล้วฝาปิด กดเปิดฝาเพื่อดูผล'
      : 'ปิด — เห็นลูกเต๋าหมุนตามปกติ'
    if (!cupMode) {
      setLidClosed(false)
      if (awaitingReveal) {
        awaitingReveal = false
        revealBtn.style.display = 'none'
        rollBtn.disabled = false
        updateResult()
      }
    }
  }

  function rebuildDice() {
    area.innerHTML = ''
    cubes.length = 0
    values.forEach((v) => {
      const scene = createDiceCube(v)
      cubes.push(scene.querySelector('.dice-cube')!)
      area.appendChild(scene)
    })
    if (!awaitingReveal) updateResult()
  }

  function resetToDefault() {
    awaitingReveal = false
    revealBtn.style.display = 'none'
    rollBtn.disabled = false
    setLidClosed(false)
    values = Array.from({ length: count }, () => DEFAULT_VALUE)
    rebuildDice()
    updateResult()
  }

  function setCount(n: number) {
    if (rolling || awaitingReveal) return
    count = n
    shell.querySelectorAll('.count-btn').forEach((btn) => {
      btn.classList.toggle('active', Number((btn as HTMLButtonElement).dataset.count) === count)
    })
    resetToDefault()
  }

  shell.querySelectorAll<HTMLButtonElement>('.count-btn').forEach((btn) => {
    btn.addEventListener('click', () => setCount(Number(btn.dataset.count)))
  })

  cupToggle.addEventListener('change', () => {
    if (rolling) {
      cupToggle.checked = cupMode
      return
    }
    cupMode = cupToggle.checked
    updateCupUI()
  })

  revealBtn.addEventListener('click', () => {
    if (!awaitingReveal) return
    openLid()
    awaitingReveal = false
    revealBtn.style.display = 'none'
    rollBtn.disabled = false
    updateResult()
    resultWrap.classList.add('pop')
    setTimeout(() => resultWrap.classList.remove('pop'), 400)
  })

  rollBtn.addEventListener('click', async () => {
    if (rolling || awaitingReveal) return
    rolling = true
    rollBtn.disabled = true

    if (cupMode) {
      updateResult(true)
      await closeLid()
    }

    area.classList.add('is-rolling')
    if (cupMode) arena.classList.add('is-shaking')

    const finals = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6))
    await Promise.all(cubes.map((cube, i) => animateDiceRoll(cube, finals[i])))

    values = cubes.map((cube) => Number(cube.dataset.value))
    area.classList.remove('is-rolling')
    arena.classList.remove('is-shaking')

    if (cupMode) {
      awaitingReveal = true
      revealBtn.style.display = 'inline-flex'
      updateResult(true)
    } else {
      updateResult()
      resultWrap.classList.add('pop')
      setTimeout(() => resultWrap.classList.remove('pop'), 400)
      rollBtn.disabled = false
    }

    rolling = false
  })

  updateCupUI()
  resetToDefault()
}
