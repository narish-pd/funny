import './style.css'
import { renderHome } from './games/home'
import { renderDice } from './games/dice'
import { renderCrocodile } from './games/crocodile'
import { renderCoin } from './games/coin'
import { renderWheel } from './games/wheel'
import { renderPicker } from './games/picker'
import { renderMines } from './games/mines'

export type GameId = 'home' | 'dice' | 'crocodile' | 'coin' | 'wheel' | 'picker' | 'mines'

const GAMES: Record<GameId, () => void> = {
  home: renderHome,
  dice: renderDice,
  crocodile: renderCrocodile,
  coin: renderCoin,
  wheel: renderWheel,
  picker: renderPicker,
  mines: renderMines,
}

export function navigate(id: GameId) {
  history.pushState({ game: id }, '', id === 'home' ? '/' : `#${id}`)
  GAMES[id]()
}

window.addEventListener('popstate', () => {
  const id = getGameFromHash()
  GAMES[id]()
})

function getGameFromHash(): GameId {
  const hash = location.hash.replace('#', '') as GameId
  return hash in GAMES ? hash : 'home'
}

navigate(getGameFromHash())
