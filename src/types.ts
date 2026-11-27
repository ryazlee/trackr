export type GameId = string

export type WinCondition = 'highest' | 'lowest'

export type Flip7Entry = {
  kind: 'flip7'
  bust: boolean
  numberSum: number
  x2: boolean
  /** Selected modifier values, e.g. [2, 4, 10] */
  modifiers: number[]
  flip7Bonus: boolean
}

export type HeartsEntry = {
  kind: 'hearts'
  hearts: number
  queenOfSpades: boolean
  /** Round-level shoot-the-moon is stored on the round; this marks the shooter. */
  shotMoon: boolean
}

export type ScoreEntry = Flip7Entry | HeartsEntry | { kind: 'simple'; points: number }

export type Player = {
  id: string
  name: string
}

export type Round = {
  id: string
  /** Computed points for this round per player */
  scores: Record<string, number>
  /** Factor inputs used to compute scores (for edit / history) */
  entries: Record<string, ScoreEntry>
  createdAt: string
}

export type SessionStatus = 'active' | 'finished'

export type Session = {
  id: string
  gameId: GameId
  players: Player[]
  rounds: Round[]
  status: SessionStatus
  createdAt: string
  updatedAt: string
}

export type GameConfig = {
  id: GameId
  name: string
  description: string
  targetScore: number
  winCondition: WinCondition
  playerMin: number
  playerMax: number
  /** Built-in vs user-added later via localStorage */
  builtin: boolean
  scoring: 'flip7' | 'hearts' | 'simple'
}
