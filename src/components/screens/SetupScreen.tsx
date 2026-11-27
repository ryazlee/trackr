import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import type { Player, Session, WinCondition } from '../../types'
import {
  getGameById,
  loadGames,
  newId,
  upsertCustomGame,
} from '../../utils/storage'
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
  const initialGame = params.get('game') ?? 'general'

  const [gameId, setGameId] = useState(initialGame)
  const [nameDraft, setNameDraft] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [customTitle, setCustomTitle] = useState('')
  const [targetDraft, setTargetDraft] = useState('')
  const [winCondition, setWinCondition] = useState<WinCondition>('highest')
  const [saveAsCustom, setSaveAsCustom] = useState(false)

  const game = useMemo(() => getGameById(gameId) ?? games[0], [gameId, games])
  const isSimple = game?.scoring === 'simple'

  const selectGame = (id: string) => {
    setGameId(id)
    const next = getGameById(id)
    if (next) {
      setWinCondition(next.winCondition)
      setTargetDraft(next.targetScore > 0 ? String(next.targetScore) : '')
      setCustomTitle(next.builtin ? '' : next.name)
      setSaveAsCustom(false)
    }
  }

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
    players.length >= (game?.playerMin ?? 1) &&
    players.length <= (game?.playerMax ?? 12)

  const start = () => {
    if (!game || !canStart) return

    const title = customTitle.trim()
    const parsedTarget = Number.parseInt(targetDraft, 10)
    const targetScore =
      targetDraft.trim() === '' || !Number.isFinite(parsedTarget)
        ? isSimple
          ? 0
          : game.targetScore
        : Math.max(0, parsedTarget)

    if (isSimple && saveAsCustom && title && title.toLowerCase() !== 'general') {
      upsertCustomGame({
        id: newId('g'),
        name: title,
        description: targetScore
          ? `Custom · to ${targetScore} · ${winCondition}`
          : `Custom · open-ended · ${winCondition}`,
        targetScore,
        winCondition,
        playerMin: 1,
        playerMax: 12,
        builtin: false,
        scoring: 'simple',
      })
    }

    const now = new Date().toISOString()
    const session: Session = {
      id: newId('s'),
      gameId: game.id,
      players,
      rounds: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
      title: title || undefined,
      targetScore: isSimple ? targetScore : undefined,
      winCondition: isSimple ? winCondition : undefined,
    }
    onCreate(session)
    navigate(`/play/${session.id}`)
  }

  const subtitle = (() => {
    if (!game) return undefined
    if (!isSimple) return `${game.name} · to ${game.targetScore}`
    const target =
      targetDraft.trim() === '' ? 'open-ended' : `to ${targetDraft.trim()}`
    return `${customTitle.trim() || game.name} · ${target}`
  })()

  return (
    <AppShell
      header={<AppHeader title="New game" subtitle={subtitle} backTo="/" />}
      footer={
        <>
          <p className="status">
            {game
              ? `${game.playerMin}–${game.playerMax} players · ${
                  isSimple
                    ? winCondition === 'highest'
                      ? 'highest'
                      : 'lowest'
                    : game.winCondition === 'highest'
                      ? 'highest'
                      : 'lowest'
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
              onClick={() => selectGame(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        {game ? (
          <p className="meta meta--sm" style={{ marginTop: '0.75rem' }}>
            {game.description}
          </p>
        ) : null}
      </SectionCard>

      {isSimple ? (
        <SectionCard title="Rules" hint="Optional — leave target blank for open-ended play.">
          <label className="field">
            <span className="field__label">Name</span>
            <input
              className="input"
              type="text"
              value={customTitle}
              placeholder="General"
              autoCapitalize="words"
              onChange={(event) => setCustomTitle(event.target.value)}
            />
          </label>

          <label className="field" style={{ marginTop: '0.85rem' }}>
            <span className="field__label">Target score</span>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              value={targetDraft}
              placeholder="None"
              onChange={(event) => {
                const next = event.target.value
                if (next === '' || /^\d*$/.test(next)) setTargetDraft(next)
              }}
            />
          </label>

          <div style={{ marginTop: '0.85rem' }}>
            <span className="field__label">Winner</span>
            <div className="chip-row" style={{ marginTop: '0.35rem' }}>
              <button
                type="button"
                className={['chip', winCondition === 'highest' ? 'chip--active' : null]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setWinCondition('highest')}
              >
                Highest
              </button>
              <button
                type="button"
                className={['chip', winCondition === 'lowest' ? 'chip--active' : null]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setWinCondition('lowest')}
              >
                Lowest
              </button>
            </div>
          </div>

          {customTitle.trim() && customTitle.trim().toLowerCase() !== 'general' ? (
            <label className="check-row" style={{ marginTop: '0.85rem' }}>
              <input
                type="checkbox"
                checked={saveAsCustom}
                onChange={(event) => setSaveAsCustom(event.target.checked)}
              />
              <span>Save “{customTitle.trim()}” for next time</span>
            </label>
          ) : null}
        </SectionCard>
      ) : null}

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
