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

/** มุมหมุนเพื่อให้เห็นแต่ละหน้า (1=หน้า, 2=ขวา, 3=บน, 4=ล่าง, 5=ซ้าย, 6=หลัง) */
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

/** เพิ่มเฉพาะรอบเต็ม 360° เพื่อไม่ให้หน้าที่แสดงเพี้ยน */
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

export function renderDice() {
  let count = 2
  let rolling = false
  let values: number[] = [DEFAULT_VALUE, DEFAULT_VALUE]
  const cubes: HTMLDivElement[] = []

  const shell = pageShell('ทอยลูกเต๋า', '🎲', `
    <div class="dice-controls">
      <label>จำนวนลูกเต๋า</label>
      <div class="count-picker">
        ${[1, 2, 3, 4, 5, 6].map((n) => `<button class="count-btn ${n === count ? 'active' : ''}" data-count="${n}">${n}</button>`).join('')}
      </div>
    </div>
    <div class="dice-area" id="dice-area"></div>
    <div class="dice-result" id="dice-result">รวม: <strong>${DEFAULT_VALUE * count}</strong></div>
    <button class="primary-btn roll-btn" id="roll-btn">🎲 ทอย!</button>
  `)

  mountPage(shell)

  const area = shell.querySelector('#dice-area')!
  const resultEl = shell.querySelector('#dice-result strong')!
  const rollBtn = shell.querySelector<HTMLButtonElement>('#roll-btn')!

  function updateResult() {
    resultEl.textContent = String(sumValues(values))
  }

  function rebuildDice() {
    area.innerHTML = ''
    cubes.length = 0
    values.forEach((v) => {
      const scene = createDiceCube(v)
      cubes.push(scene.querySelector('.dice-cube')!)
      area.appendChild(scene)
    })
    updateResult()
  }

  function resetToDefault() {
    values = Array.from({ length: count }, () => DEFAULT_VALUE)
    rebuildDice()
  }

  function setCount(n: number) {
    if (rolling) return
    count = n
    shell.querySelectorAll('.count-btn').forEach((btn) => {
      btn.classList.toggle('active', Number((btn as HTMLButtonElement).dataset.count) === count)
    })
    resetToDefault()
  }

  shell.querySelectorAll<HTMLButtonElement>('.count-btn').forEach((btn) => {
    btn.addEventListener('click', () => setCount(Number(btn.dataset.count)))
  })

  rollBtn.addEventListener('click', async () => {
    if (rolling) return
    rolling = true
    rollBtn.disabled = true
    area.classList.add('is-rolling')

    const finals = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6))
    await Promise.all(cubes.map((cube, i) => animateDiceRoll(cube, finals[i])))

    values = cubes.map((cube) => Number(cube.dataset.value))
    updateResult()

    rolling = false
    rollBtn.disabled = false
    area.classList.remove('is-rolling')
    resultEl.parentElement!.classList.add('pop')
    setTimeout(() => resultEl.parentElement!.classList.remove('pop'), 400)
  })

  resetToDefault()
}
