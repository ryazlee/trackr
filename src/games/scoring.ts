import type { Flip7Entry, HeartsEntry, ScoreEntry } from '../types'

export const FLIP7_MODIFIERS = [2, 4, 6, 8, 10] as const

export function emptyFlip7Entry(): Flip7Entry {
  return {
    kind: 'flip7',
    bust: false,
    numberSum: 0,
    x2: false,
    modifiers: [],
    flip7Bonus: false,
  }
}

export function emptyHeartsEntry(): HeartsEntry {
  return {
    kind: 'hearts',
    hearts: 0,
    queenOfSpades: false,
    shotMoon: false,
  }
}

export function emptySimpleEntry(): ScoreEntry {
  return { kind: 'simple', points: 0 }
}

export function emptyEntryForScoring(scoring: 'flip7' | 'hearts' | 'simple'): ScoreEntry {
  if (scoring === 'flip7') return emptyFlip7Entry()
  if (scoring === 'hearts') return emptyHeartsEntry()
  return emptySimpleEntry()
}

/** Flip 7: number sum → ×2 → +modifiers → +15 Flip 7. Bust = 0. */
export function scoreFlip7(entry: Flip7Entry): number {
  if (entry.bust) return 0
  const numbers = Math.max(0, entry.numberSum)
  const doubled = entry.x2 ? numbers * 2 : numbers
  const mods = entry.modifiers.reduce((sum, value) => sum + value, 0)
  const bonus = entry.flip7Bonus ? 15 : 0
  return doubled + mods + bonus
}

/**
 * Hearts: hearts (1 each) + QoS (13).
 * Shoot the moon: shooter scores 0, everyone else scores 26
 * (classic alternate; stored via shotMoon on the shooter entry).
 */
export function scoreHeartsRound(
  entries: Record<string, HeartsEntry>,
): Record<string, number> {
  const shooterId = Object.entries(entries).find(([, entry]) => entry.shotMoon)?.[0]

  if (shooterId) {
    const scores: Record<string, number> = {}
    for (const playerId of Object.keys(entries)) {
      scores[playerId] = playerId === shooterId ? 0 : 26
    }
    return scores
  }

  const scores: Record<string, number> = {}
  for (const [playerId, entry] of Object.entries(entries)) {
    const hearts = Math.max(0, Math.min(13, entry.hearts))
    const qos = entry.queenOfSpades ? 13 : 0
    scores[playerId] = hearts + qos
  }
  return scores
}

export function scoreEntry(entry: ScoreEntry): number {
  if (entry.kind === 'flip7') return scoreFlip7(entry)
  if (entry.kind === 'hearts') {
    // Single-entry fallback (no moon context)
    if (entry.shotMoon) return 0
    return Math.max(0, Math.min(13, entry.hearts)) + (entry.queenOfSpades ? 13 : 0)
  }
  return entry.points
}

export function scoreRoundEntries(
  scoring: 'flip7' | 'hearts' | 'simple',
  entries: Record<string, ScoreEntry>,
): Record<string, number> {
  if (scoring === 'hearts') {
    const heartsEntries: Record<string, HeartsEntry> = {}
    for (const [id, entry] of Object.entries(entries)) {
      if (entry.kind === 'hearts') heartsEntries[id] = entry
    }
    return scoreHeartsRound(heartsEntries)
  }

  const scores: Record<string, number> = {}
  for (const [id, entry] of Object.entries(entries)) {
    scores[id] = scoreEntry(entry)
  }
  return scores
}

export function totalsForSession(
  playerIds: string[],
  rounds: { scores: Record<string, number> }[],
): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const id of playerIds) totals[id] = 0
  for (const round of rounds) {
    for (const id of playerIds) {
      totals[id] += round.scores[id] ?? 0
    }
  }
  return totals
}

/** targetScore <= 0 means open-ended — never auto-finish. */
export function isGameOver(
  totals: Record<string, number>,
  targetScore: number,
): boolean {
  if (targetScore <= 0) return false
  return Object.values(totals).some((score) => score >= targetScore)
}

export function standingsOrder(
  playerIds: string[],
  totals: Record<string, number>,
  winCondition: 'highest' | 'lowest',
): string[] {
  return [...playerIds].sort((a, b) => {
    const diff = totals[a] - totals[b]
    return winCondition === 'highest' ? -diff : diff
  })
}
