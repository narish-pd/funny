import './style.css'
import { renderHome } from './games/home'
import { renderDice } from './games/dice'
import { renderCrocodile } from './games/crocodile'
import { renderCoin } from './games/coin'
import { renderWheel } from './games/wheel'
import { renderPicker } from './games/picker'
import { renderMines } from './games/mines'
import { updateSEO } from './seo'
import type { GameId } from './types'

export type { GameId } from './types'

const GAMES: Record<GameId, () => void> = {
  home: renderHome,
  dice: renderDice,
  crocodile: renderCrocodile,
  coin: renderCoin,
  wheel: renderWheel,
  picker: renderPicker,
  mines: renderMines,
}

const GAME_IDS = new Set(Object.keys(GAMES))

function resolveGame(): GameId {
  const segment = location.pathname.replace(/^\/+|\/+$/g, '')
  if (!segment) return 'home'
  return GAME_IDS.has(segment) ? (segment as GameId) : 'home'
}

export function navigate(id: GameId, replace = false) {
  const path = id === 'home' ? '/' : `/${id}`
  if (replace) history.replaceState({ game: id }, '', path)
  else history.pushState({ game: id }, '', path)
  updateSEO(id)
  GAMES[id]()
}

window.addEventListener('popstate', () => {
  const id = resolveGame()
  updateSEO(id)
  GAMES[id]()
})

document.documentElement.classList.add('js-loaded')
document.getElementById('static-seo')?.remove()

const initial = resolveGame()
const segment = location.pathname.replace(/^\/+|\/+$/g, '')
if (segment && !GAME_IDS.has(segment)) {
  navigate('home', true)
} else {
  navigate(initial, true)
}
