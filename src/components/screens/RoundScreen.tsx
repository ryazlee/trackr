import { useMemo, useState } from 'react'
import type { GameConfig, Round, ScoreEntry, Session } from '../../types'
import {
  emptyEntryForScoring,
  scoreEntry,
  scoreRoundEntries,
} from '../../games/scoring'
import AppHeader from '../AppHeader'
import AppShell from '../AppShell'
import Button from '../Button'
import SectionCard from '../SectionCard'
import Flip7Scorer from '../score/Flip7Scorer'
import HeartsScorer from '../score/HeartsScorer'
import SimpleScorer from '../score/SimpleScorer'
import { newId } from '../../utils/storage'

type RoundScreenProps = {
  session: Session
  game: GameConfig
  /** Existing round when editing */
  round?: Round
  onCancel: () => void
  onSave: (round: Round) => void
}

function buildInitialEntries(
  session: Session,
  game: GameConfig,
  round?: Round,
): Record<string, ScoreEntry> {
  const entries: Record<string, ScoreEntry> = {}
  for (const player of session.players) {
    entries[player.id] =
      round?.entries[player.id] ?? emptyEntryForScoring(game.scoring)
  }
  return entries
}

export default function RoundScreen({
  session,
  game,
  round,
  onCancel,
  onSave,
}: RoundScreenProps) {
  const isSimple = game.scoring === 'simple'
  const [activePlayerId, setActivePlayerId] = useState(session.players[0]?.id ?? '')
  const [entries, setEntries] = useState<Record<string, ScoreEntry>>(() =>
    buildInitialEntries(session, game, round),
  )

  const scores = useMemo(
    () => scoreRoundEntries(game.scoring, entries),
    [entries, game.scoring],
  )

  const moonShooter = useMemo(() => {
    if (game.scoring !== 'hearts') return null
    const found = Object.entries(entries).find(
      ([, entry]) => entry.kind === 'hearts' && entry.shotMoon,
    )
    return found?.[0] ?? null
  }, [entries, game.scoring])

  const updateEntry = (playerId: string, entry: ScoreEntry) => {
    setEntries((current) => {
      const next = { ...current, [playerId]: entry }
      if (entry.kind === 'hearts' && entry.shotMoon) {
        for (const otherId of Object.keys(next)) {
          if (otherId === playerId) continue
          const other = next[otherId]
          if (other.kind === 'hearts' && other.shotMoon) {
            next[otherId] = { ...other, shotMoon: false }
          }
        }
      }
      return next
    })
  }

  const save = () => {
    const now = new Date().toISOString()
    onSave({
      id: round?.id ?? newId('r'),
      scores: scoreRoundEntries(game.scoring, entries),
      entries,
      createdAt: round?.createdAt ?? now,
    })
  }

  const activePlayer = session.players.find((player) => player.id === activePlayerId)
  const activeEntry = activePlayerId ? entries[activePlayerId] : null

  return (
    <AppShell
      header={
        <AppHeader
          title={round ? 'Edit round' : `Round ${session.rounds.length + 1}`}
          subtitle={game.name}
          backTo={`/play/${session.id}`}
        />
      }
      footer={
        <div className="actions">
          <Button label="Save round" onClick={save} />
          <Button label="Cancel" variant="secondary" onClick={onCancel} />
        </div>
      }
    >
      {isSimple ? (
        <SectionCard title="Scores" hint="Tap +/− or type a number for each player.">
          <ul className="score-board">
            {session.players.map((player) => {
              const entry = entries[player.id]
              if (!entry || entry.kind !== 'simple') return null
              return (
                <li key={player.id} className="score-board__row">
                  <div className="score-board__head">
                    <span className="score-board__name">{player.name}</span>
                    <strong className="score-board__points">{entry.points}</strong>
                  </div>
                  <SimpleScorer
                    compact
                    points={entry.points}
                    onChange={(points) =>
                      updateEntry(player.id, { kind: 'simple', points })
                    }
                  />
                </li>
              )
            })}
          </ul>
        </SectionCard>
      ) : (
        <>
          <div className="player-tabs" role="tablist" aria-label="Players">
            {session.players.map((player) => {
              const selected = player.id === activePlayerId
              return (
                <button
                  key={player.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={['player-tab', selected ? 'player-tab--active' : null]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setActivePlayerId(player.id)}
                >
                  <span className="player-tab__name">{player.name}</span>
                  <span className="player-tab__score">{scores[player.id] ?? 0}</span>
                </button>
              )
            })}
          </div>

          {activePlayer && activeEntry ? (
            <SectionCard title={activePlayer.name} hint="Adjust factors — totals update live.">
              {activeEntry.kind === 'flip7' ? (
                <Flip7Scorer
                  entry={activeEntry}
                  score={scoreEntry(activeEntry)}
                  onChange={(entry) => updateEntry(activePlayer.id, entry)}
                />
              ) : null}
              {activeEntry.kind === 'hearts' ? (
                <HeartsScorer
                  entry={activeEntry}
                  score={scores[activePlayer.id] ?? 0}
                  moonLocked={Boolean(moonShooter && moonShooter !== activePlayer.id)}
                  onChange={(entry) => updateEntry(activePlayer.id, entry)}
                />
              ) : null}
            </SectionCard>
          ) : null}
        </>
      )}

      <SectionCard title="This round">
        <ul className="round-summary">
          {session.players.map((player) => (
            <li key={player.id} className="round-summary__row">
              <span>{player.name}</span>
              <strong>{scores[player.id] ?? 0}</strong>
            </li>
          ))}
        </ul>
      </SectionCard>
    </AppShell>
  )
}
