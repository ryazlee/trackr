import { BUILTIN_GAMES, getBuiltinGame } from '../games/catalog'
import type { GameConfig, Session } from '../types'

const SESSIONS_KEY = 'trackr-sessions'
const GAMES_KEY = 'trackr-games'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota / private mode — ignore
  }
}

export function loadSessions(): Session[] {
  const sessions = readJson<Session[]>(SESSIONS_KEY, [])
  return Array.isArray(sessions) ? sessions : []
}

export function saveSessions(sessions: Session[]): void {
  writeJson(SESSIONS_KEY, sessions)
}

export function upsertSession(session: Session): Session[] {
  const sessions = loadSessions()
  const index = sessions.findIndex((item) => item.id === session.id)
  if (index >= 0) {
    sessions[index] = session
  } else {
    sessions.unshift(session)
  }
  saveSessions(sessions)
  return sessions
}

export function deleteSession(sessionId: string): Session[] {
  const sessions = loadSessions().filter((item) => item.id !== sessionId)
  saveSessions(sessions)
  return sessions
}

/** Built-ins first, then any user-added games from localStorage. */
export function loadGames(): GameConfig[] {
  const custom = readJson<GameConfig[]>(GAMES_KEY, [])
  const safeCustom = Array.isArray(custom)
    ? custom.filter((game) => game && typeof game.id === 'string' && !getBuiltinGame(game.id))
    : []
  return [...BUILTIN_GAMES, ...safeCustom.map((game) => ({ ...game, builtin: false }))]
}

export function saveCustomGames(games: GameConfig[]): void {
  writeJson(
    GAMES_KEY,
    games.filter((game) => !game.builtin),
  )
}

export function getGameById(id: string): GameConfig | undefined {
  return loadGames().find((game) => game.id === id)
}

export function newId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
