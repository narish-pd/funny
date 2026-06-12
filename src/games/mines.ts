import './mines.css'
import { mountPage, pageShell } from './layout'

type GameState = 'setup' | 'playing' | 'won' | 'lost'

interface Cell {
  isMine: boolean
  revealed: boolean
}

const DEFAULT_BLOCKS = 16
const DEFAULT_MINES = 3
const MIN_BLOCKS = 4
const MAX_BLOCKS = 64
const MIN_MINES = 1

function gridCols(total: number) {
  return Math.ceil(Math.sqrt(total))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function createBoard(total: number, mines: number): Cell[] {
  const indices = shuffle(Array.from({ length: total }, (_, i) => i))
  const mineSet = new Set(indices.slice(0, mines))
  return Array.from({ length: total }, (_, i) => ({
    isMine: mineSet.has(i),
    revealed: false,
  }))
}

export function renderMines() {
  let totalBlocks = DEFAULT_BLOCKS
  let mineCount = DEFAULT_MINES
  let cells: Cell[] = []
  let gameState: GameState = 'setup'
  let openedCount = 0

  const shell = pageShell('กล่องระเบิด', '💣', `
    <p class="game-hint">เปิดทีละช่อง หลีกเลี่ยงระเบิดให้ครบทุกช่องปลอดภัย!</p>
    <div class="mines-setup" id="mines-setup">
      <div class="mines-inputs">
        <label class="mines-field">
          <span>จำนวนบล็อกทั้งหมด</span>
          <input type="number" id="blocks-input" min="${MIN_BLOCKS}" max="${MAX_BLOCKS}" value="${DEFAULT_BLOCKS}" />
        </label>
        <label class="mines-field">
          <span>จำนวนระเบิด</span>
          <input type="number" id="mines-input" min="${MIN_MINES}" value="${DEFAULT_MINES}" />
        </label>
      </div>
      <p class="mines-error" id="mines-error" hidden></p>
      <button class="primary-btn" id="start-btn" type="button">▶ Start Game</button>
    </div>
    <div class="mines-stats" id="mines-stats">
      <div class="stat-chip"><span class="stat-label">บล็อก</span><strong id="stat-blocks">${DEFAULT_BLOCKS}</strong></div>
      <div class="stat-chip"><span class="stat-label">ระเบิด</span><strong id="stat-mines">${DEFAULT_MINES}</strong></div>
      <div class="stat-chip"><span class="stat-label">เปิดแล้ว</span><strong id="stat-opened">0</strong></div>
    </div>
    <div class="mines-board-wrap">
      <div class="mines-board" id="mines-board"></div>
    </div>
    <div class="mines-message" id="mines-message" hidden></div>
    <button class="secondary-btn" id="restart-btn" type="button" style="display:none">🔄 Restart</button>
  `)

  mountPage(shell)

  const blocksInput = shell.querySelector<HTMLInputElement>('#blocks-input')!
  const minesInput = shell.querySelector<HTMLInputElement>('#mines-input')!
  const errorEl = shell.querySelector<HTMLParagraphElement>('#mines-error')!
  const startBtn = shell.querySelector<HTMLButtonElement>('#start-btn')!
  const restartBtn = shell.querySelector<HTMLButtonElement>('#restart-btn')!
  const messageEl = shell.querySelector<HTMLElement>('#mines-message')!
  const statBlocks = shell.querySelector('#stat-blocks')!
  const statMines = shell.querySelector('#stat-mines')!
  const statOpened = shell.querySelector('#stat-opened')!
  const board = shell.querySelector<HTMLElement>('#mines-board')!

  function safeTotal() {
    return Math.min(MAX_BLOCKS, Math.max(MIN_BLOCKS, Number(blocksInput.value) || DEFAULT_BLOCKS))
  }

  function safeMines(total: number) {
    return Math.min(total - 1, Math.max(MIN_MINES, Number(minesInput.value) || DEFAULT_MINES))
  }

  function validate(): string | null {
    const total = safeTotal()
    const mines = Number(minesInput.value)
    if (mines < MIN_MINES) return `ระเบิดต้องมีอย่างน้อย ${MIN_MINES} ลูก`
    if (mines >= total) return 'จำนวนระเบิดต้องน้อยกว่าจำนวนบล็อก'
    return null
  }

  function updateStats() {
    statBlocks.textContent = String(totalBlocks)
    statMines.textContent = String(mineCount)
    statOpened.textContent = String(openedCount)
  }

  function setMessage(text: string, type: 'win' | 'lose' | '') {
    if (!text) {
      messageEl.hidden = true
      messageEl.textContent = ''
      messageEl.className = 'mines-message'
      return
    }
    messageEl.hidden = false
    messageEl.textContent = text
    messageEl.className = `mines-message is-${type}`
  }

  function paintBoard() {
    const cols = gridCols(totalBlocks)
    board.style.setProperty('--mine-cols', String(cols))
    board.innerHTML = cells
      .map((cell, i) => {
        let cls = 'mine-cell'
        if (cell.revealed) {
          cls += cell.isMine ? ' revealed mine' : ' revealed safe'
        } else if (gameState === 'lost' && cell.isMine) {
          cls += ' revealed mine show-mine'
        } else {
          cls += ' hidden'
        }
        if (gameState === 'won' || gameState === 'lost') cls += ' locked'
        const content = cell.revealed && cell.isMine ? '💣' : cell.revealed ? '✓' : ''
        return `<button type="button" class="${cls}" data-index="${i}" ${gameState !== 'playing' || cell.revealed ? 'disabled' : ''}>${content}</button>`
      })
      .join('')

    board.querySelectorAll<HTMLButtonElement>('.mine-cell:not([disabled])').forEach((btn) => {
      btn.addEventListener('click', () => onCellClick(Number(btn.dataset.index)))
    })
  }

  function lockInputs(locked: boolean) {
    blocksInput.disabled = locked
    minesInput.disabled = locked
    startBtn.disabled = locked
  }

  function startGame() {
    const err = validate()
    if (err) {
      errorEl.hidden = false
      errorEl.textContent = err
      return
    }
    errorEl.hidden = true
    totalBlocks = safeTotal()
    mineCount = safeMines(totalBlocks)
    blocksInput.value = String(totalBlocks)
    minesInput.value = String(mineCount)

    cells = createBoard(totalBlocks, mineCount)
    openedCount = 0
    gameState = 'playing'
    lockInputs(true)
    restartBtn.style.display = 'inline-flex'
    setMessage('', '')
    updateStats()
    paintBoard()
  }

  function endGame(won: boolean) {
    gameState = won ? 'won' : 'lost'
    setMessage(won ? 'You Win' : 'Game Over', won ? 'win' : 'lose')
    paintBoard()
  }

  function onCellClick(index: number) {
    if (gameState !== 'playing') return
    const cell = cells[index]
    if (cell.revealed) return

    cell.revealed = true
    const btn = board.querySelector<HTMLButtonElement>(`[data-index="${index}"]`)
    btn?.classList.add('revealing')

    setTimeout(() => {
      if (cell.isMine) {
        openedCount = cells.filter((c) => c.revealed && !c.isMine).length
        updateStats()
        endGame(false)
        return
      }

      openedCount++
      updateStats()
      paintBoard()

      const safeTotal = totalBlocks - mineCount
      if (openedCount >= safeTotal) endGame(true)
    }, 280)
  }

  function restart() {
    gameState = 'setup'
    cells = []
    openedCount = 0
    lockInputs(false)
    restartBtn.style.display = 'none'
    setMessage('', '')
    updateStats()
    board.innerHTML = '<p class="mines-placeholder">กด Start Game เพื่อเริ่ม</p>'
  }

  blocksInput.addEventListener('input', () => {
    errorEl.hidden = true
    const total = safeTotal()
    minesInput.max = String(total - 1)
    if (Number(minesInput.value) >= total) minesInput.value = String(total - 1)
    statBlocks.textContent = String(total)
    statMines.textContent = minesInput.value
  })

  minesInput.addEventListener('input', () => {
    errorEl.hidden = true
    statMines.textContent = minesInput.value
  })

  startBtn.addEventListener('click', startGame)
  restartBtn.addEventListener('click', restart)

  board.innerHTML = '<p class="mines-placeholder">กด Start Game เพื่อเริ่ม</p>'
  updateStats()
}
