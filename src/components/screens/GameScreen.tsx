import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { ResolvedGame, Round, Session } from '../../types'
import {
  isGameOver,
  standingsOrder,
  totalsForSession,
} from '../../games/scoring'
import AppHeader from '../AppHeader'
import AppShell from '../AppShell'
import Button from '../Button'
import SectionCard from '../SectionCard'
import StandingsList from '../StandingsList'
import RoundScreen from './RoundScreen'

type GameScreenProps = {
  session: Session
  game: ResolvedGame
  onUpdate: (session: Session) => void
  onDelete: () => void
}

function rulesSubtitle(game: ResolvedGame, finished: boolean, leaderName?: string): string {
  if (finished) return leaderName ? `${leaderName} wins` : 'Finished'
  if (game.targetScore <= 0) {
    return game.winCondition === 'highest' ? 'Open-ended · high score' : 'Open-ended · low score'
  }
  return `First to ${game.targetScore} · ${
    game.winCondition === 'highest' ? 'high score' : 'low score'
  }`
}

export default function GameScreen({
  session,
  game,
  onUpdate,
  onDelete,
}: GameScreenProps) {
  const [mode, setMode] = useState<'play' | 'round'>('play')
  const [editingRound, setEditingRound] = useState<Round | undefined>()

  const totals = useMemo(
    () =>
      totalsForSession(
        session.players.map((player) => player.id),
        session.rounds,
      ),
    [session],
  )

  const finished =
    session.status === 'finished' || isGameOver(totals, game.targetScore)

  const leaderId = standingsOrder(
    session.players.map((player) => player.id),
    totals,
    game.winCondition,
  )[0]
  const leader = session.players.find((player) => player.id === leaderId)

  const persist = (next: Session) => {
    const withStamp = { ...next, updatedAt: new Date().toISOString() }
    const nextTotals = totalsForSession(
      withStamp.players.map((player) => player.id),
      withStamp.rounds,
    )
    if (isGameOver(nextTotals, game.targetScore)) {
      withStamp.status = 'finished'
    } else if (withStamp.status === 'finished' && game.targetScore > 0) {
      withStamp.status = 'active'
    } else if (game.targetScore <= 0) {
      withStamp.status = 'active'
    }
    onUpdate(withStamp)
  }

  const saveRound = (round: Round) => {
    const existing = session.rounds.findIndex((item) => item.id === round.id)
    const rounds =
      existing >= 0
        ? session.rounds.map((item, index) => (index === existing ? round : item))
        : [...session.rounds, round]
    persist({ ...session, rounds })
    setEditingRound(undefined)
    setMode('play')
  }

  const deleteRound = (roundId: string) => {
    if (!window.confirm('Delete this round?')) return
    persist({
      ...session,
      rounds: session.rounds.filter((round) => round.id !== roundId),
    })
  }

  const markFinished = () => {
    onUpdate({
      ...session,
      status: 'finished',
      updatedAt: new Date().toISOString(),
    })
  }

  if (mode === 'round') {
    return (
      <RoundScreen
        session={session}
        game={game}
        round={editingRound}
        onCancel={() => {
          setEditingRound(undefined)
          setMode('play')
        }}
        onSave={saveRound}
      />
    )
  }

  return (
    <AppShell
      header={
        <AppHeader
          title={game.displayName}
          subtitle={rulesSubtitle(game, finished, leader?.name)}
          backTo="/"
        />
      }
      footer={
        finished ? (
          <>
            <p className="status">
              {leader ? `${leader.name} wins` : 'Finished'}
              {game.targetScore > 0 ? ` · target ${game.targetScore}` : ''}
            </p>
            <div className="actions">
              <Button
                label="New round anyway"
                variant="secondary"
                onClick={() => {
                  setEditingRound(undefined)
                  setMode('round')
                }}
              />
              <Button label="Home" to="/" />
            </div>
          </>
        ) : (
          <>
            <p className="status">
              Round {session.rounds.length + 1}
              {game.scoring === 'simple'
                ? ' · tap +/− or type scores'
                : ' · tap a player when scoring'}
            </p>
            {game.targetScore <= 0 ? (
              <div className="actions">
                <Button
                  label="Add round"
                  icon={<Plus size={16} />}
                  onClick={() => {
                    setEditingRound(undefined)
                    setMode('round')
                  }}
                />
                <Button label="End game" variant="secondary" onClick={markFinished} />
              </div>
            ) : (
              <Button
                label="Add round"
                icon={<Plus size={16} />}
                block
                onClick={() => {
                  setEditingRound(undefined)
                  setMode('round')
                }}
              />
            )}
          </>
        )
      }
    >
      <SectionCard title="Standings">
        <StandingsList
          players={session.players}
          totals={totals}
          winCondition={game.winCondition}
          targetScore={game.targetScore}
        />
        <p className="meta meta--sm meta--muted" style={{ marginTop: '0.75rem' }}>
          Scores stay on this phone (local storage).
        </p>
      </SectionCard>

      <SectionCard
        title="Rounds"
        hint={session.rounds.length === 0 ? 'No rounds yet — add the first score.' : undefined}
      >
        {session.rounds.length === 0 ? null : (
          <ul className="round-history">
            {[...session.rounds].reverse().map((round, reverseIndex) => {
              const roundNumber = session.rounds.length - reverseIndex
              return (
                <li key={round.id} className="round-history__item">
                  <div className="round-history__head">
                    <span className="round-history__title">Round {roundNumber}</span>
                    <div className="round-history__actions">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Edit round ${roundNumber}`}
                        onClick={() => {
                          setEditingRound(round)
                          setMode('round')
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Delete round ${roundNumber}`}
                        onClick={() => deleteRound(round.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <ul className="round-summary">
                    {session.players.map((player) => (
                      <li key={player.id} className="round-summary__row">
                        <span>{player.name}</span>
                        <strong>{round.scores[player.id] ?? 0}</strong>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>

      <div className="danger-zone">
        <Button
          label="Delete game"
          variant="danger"
          size="sm"
          onClick={() => {
            if (window.confirm('Delete this entire game from this device?')) onDelete()
          }}
        />
        <Link className="meta meta--sm" to="/">
          Back home
        </Link>
      </div>
    </AppShell>
  )
}
