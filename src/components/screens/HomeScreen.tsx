import { ChevronRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { loadGames, resolveGame } from '../../utils/storage'
import type { Session } from '../../types'
import AppHeader from '../AppHeader'
import AppShell from '../AppShell'
import Button from '../Button'
import MakerCredit from '../MakerCredit'
import SectionCard from '../SectionCard'
import StandingsList from '../StandingsList'
import { totalsForSession } from '../../games/scoring'

type HomeScreenProps = {
  sessions: Session[]
  onDeleteSession: (sessionId: string) => void
}

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export default function HomeScreen({ sessions, onDeleteSession }: HomeScreenProps) {
  const games = loadGames()
  const active = sessions.filter((session) => session.status === 'active')
  const finished = sessions.filter((session) => session.status === 'finished').slice(0, 8)

  return (
    <AppShell
      centered={active.length === 0 && finished.length === 0}
      header={<AppHeader title="trackr" subtitle="Score games on your phone." quiet />}
    >
      <div className="home-hero">
        <p className="home__lede">General scores, Flip 7, Hearts — all on this device.</p>
        <MakerCredit />
        <Button label="New game" icon={<Plus size={16} />} to="/new?game=general" block />
      </div>

      <SectionCard title="Games" hint="General works for any game. Save named customs from setup.">
        <ul className="game-list">
          {games.map((game) => (
            <li key={game.id}>
              <Link className="game-list__item" to={`/new?game=${game.id}`}>
                <span className="game-list__copy">
                  <span className="game-list__name">{game.name}</span>
                  <span className="game-list__meta">{game.description}</span>
                </span>
                <ChevronRight size={18} className="game-list__chev" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>

      {active.length > 0 ? (
        <SectionCard title="In progress">
          <ul className="session-list">
            {active.map((session) => {
              const game = resolveGame(session)
              if (!game) return null
              const totals = totalsForSession(
                session.players.map((player) => player.id),
                session.rounds,
              )
              return (
                <li key={session.id} className="session-card">
                  <Link className="session-card__link" to={`/play/${session.id}`}>
                    <div className="session-card__head">
                      <span className="session-card__title">{game.displayName}</span>
                      <span className="session-card__when">{formatWhen(session.updatedAt)}</span>
                    </div>
                    <p className="session-card__meta">
                      Round {session.rounds.length + 1} · {session.players.map((p) => p.name).join(', ')}
                    </p>
                  </Link>
                  <StandingsList
                    players={session.players}
                    totals={totals}
                    winCondition={game.winCondition}
                    targetScore={game.targetScore}
                  />
                  <div className="session-card__actions">
                    <Button label="Continue" to={`/play/${session.id}`} size="sm" />
                    <Button
                      label="Delete"
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Delete this game?')) onDeleteSession(session.id)
                      }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </SectionCard>
      ) : null}

      {finished.length > 0 ? (
        <SectionCard title="Recent">
          <ul className="session-list">
            {finished.map((session) => {
              const game = resolveGame(session)
              if (!game) return null
              const totals = totalsForSession(
                session.players.map((player) => player.id),
                session.rounds,
              )
              return (
                <li key={session.id} className="session-card session-card--done">
                  <Link className="session-card__link" to={`/play/${session.id}`}>
                    <div className="session-card__head">
                      <span className="session-card__title">{game.displayName}</span>
                      <span className="session-card__when">{formatWhen(session.updatedAt)}</span>
                    </div>
                  </Link>
                  <StandingsList
                    players={session.players}
                    totals={totals}
                    winCondition={game.winCondition}
                    targetScore={game.targetScore}
                  />
                </li>
              )
            })}
          </ul>
        </SectionCard>
      ) : null}
    </AppShell>
  )
}
