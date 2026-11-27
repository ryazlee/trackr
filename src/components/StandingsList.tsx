import { standingsOrder } from '../games/scoring'
import type { Player, WinCondition } from '../types'

type StandingsListProps = {
  players: Player[]
  totals: Record<string, number>
  winCondition: WinCondition
  targetScore: number
  highlightLeader?: boolean
}

export default function StandingsList({
  players,
  totals,
  winCondition,
  targetScore,
  highlightLeader = true,
}: StandingsListProps) {
  const ordered = standingsOrder(
    players.map((player) => player.id),
    totals,
    winCondition,
  )
  const byId = new Map(players.map((player) => [player.id, player]))

  return (
    <ol className="standings">
      {ordered.map((playerId, index) => {
        const player = byId.get(playerId)
        if (!player) return null
        const total = totals[playerId] ?? 0
        const over = targetScore > 0 && total >= targetScore
        const lead = highlightLeader && index === 0
        return (
          <li
            key={playerId}
            className={[
              'standings__row',
              lead ? 'standings__row--lead' : null,
              over ? 'standings__row--over' : null,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="standings__rank">{index + 1}</span>
            <span className="standings__name">{player.name}</span>
            <span className="standings__score">{total}</span>
          </li>
        )
      })}
    </ol>
  )
}
