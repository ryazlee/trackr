import type { GameConfig } from '../types'

export const BUILTIN_GAMES: GameConfig[] = [
  {
    id: 'flip7',
    name: 'Flip 7',
    description: 'Race to 200. Number cards, x2, modifiers, Flip 7 bonus.',
    targetScore: 200,
    winCondition: 'highest',
    playerMin: 2,
    playerMax: 8,
    builtin: true,
    scoring: 'flip7',
  },
  {
    id: 'hearts',
    name: 'Hearts',
    description: 'Avoid hearts & the queen. First to 100 ends it; lowest wins.',
    targetScore: 100,
    winCondition: 'lowest',
    playerMin: 3,
    playerMax: 7,
    builtin: true,
    scoring: 'hearts',
  },
]

export function getBuiltinGame(id: string): GameConfig | undefined {
  return BUILTIN_GAMES.find((game) => game.id === id)
}
