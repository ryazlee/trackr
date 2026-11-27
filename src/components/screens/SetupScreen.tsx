import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import type { Player, Session } from '../../types'
import { getGameById, loadGames, newId } from '../../utils/storage'
import AppHeader from '../AppHeader'
import AppShell from '../AppShell'
import Button from '../Button'
import SectionCard from '../SectionCard'

type SetupScreenProps = {
  onCreate: (session: Session) => void
}

export default function SetupScreen({ onCreate }: SetupScreenProps) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const games = loadGames()
  const initialGame = params.get('game') ?? games[0]?.id ?? 'flip7'

  const [gameId, setGameId] = useState(initialGame)
  const [nameDraft, setNameDraft] = useState('')
  const [players, setPlayers] = useState<Player[]>([])

  const game = useMemo(() => getGameById(gameId) ?? games[0], [gameId, games])

  const addPlayer = () => {
    const name = nameDraft.trim()
    if (!name) return
    if (players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
      setNameDraft('')
      return
    }
    if (game && players.length >= game.playerMax) return
    setPlayers((current) => [...current, { id: newId('p'), name }])
    setNameDraft('')
  }

  const removePlayer = (id: string) => {
    setPlayers((current) => current.filter((player) => player.id !== id))
  }

  const canStart =
    Boolean(game) &&
    players.length >= (game?.playerMin ?? 2) &&
    players.length <= (game?.playerMax ?? 12)

  const start = () => {
    if (!game || !canStart) return
    const now = new Date().toISOString()
    const session: Session = {
      id: newId('s'),
      gameId: game.id,
      players,
      rounds: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    onCreate(session)
    navigate(`/play/${session.id}`)
  }

  return (
    <AppShell
      header={
        <AppHeader
          title="New game"
          subtitle={game ? `${game.name} · to ${game.targetScore}` : undefined}
          backTo="/"
        />
      }
      footer={
        <>
          <p className="status">
            {game
              ? `${game.playerMin}–${game.playerMax} players · ${
                  game.winCondition === 'highest' ? 'highest' : 'lowest'
                } wins`
              : 'Pick a game'}
          </p>
          <Button label="Start scoring" block disabled={!canStart} onClick={start} />
        </>
      }
    >
      <SectionCard title="Game">
        <div className="chip-row">
          {games.map((item) => (
            <button
              key={item.id}
              type="button"
              className={['chip', item.id === gameId ? 'chip--active' : null].filter(Boolean).join(' ')}
              onClick={() => setGameId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        {game ? <p className="meta meta--sm" style={{ marginTop: '0.75rem' }}>{game.description}</p> : null}
      </SectionCard>

      <SectionCard title="Players">
        <div className="inline-add">
          <input
            className="input"
            type="text"
            value={nameDraft}
            placeholder="Player name"
            autoCapitalize="words"
            autoComplete="off"
            onChange={(event) => setNameDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addPlayer()
              }
            }}
          />
          <button
            type="button"
            className="btn btn--primary"
            disabled={!nameDraft.trim() || Boolean(game && players.length >= game.playerMax)}
            onClick={addPlayer}
            aria-label="Add player"
          >
            <Plus size={18} />
          </button>
        </div>

        {players.length === 0 ? (
          <p className="meta meta--muted" style={{ marginTop: '0.85rem' }}>
            Add everyone at the table.
          </p>
        ) : (
          <ul className="player-setup">
            {players.map((player, index) => (
              <li key={player.id} className="player-setup__row">
                <span className="player-setup__index">{index + 1}</span>
                <span className="player-setup__name">{player.name}</span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove ${player.name}`}
                  onClick={() => removePlayer(player.id)}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </AppShell>
  )
}
