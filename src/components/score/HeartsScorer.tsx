import { Minus, Plus } from 'lucide-react'
import type { HeartsEntry } from '../../types'

type HeartsScorerProps = {
  entry: HeartsEntry
  onChange: (entry: HeartsEntry) => void
  score: number
  moonLocked?: boolean
}

export default function HeartsScorer({
  entry,
  onChange,
  score,
  moonLocked = false,
}: HeartsScorerProps) {
  const set = (patch: Partial<HeartsEntry>) => onChange({ ...entry, ...patch })
  const disabled = entry.shotMoon || moonLocked

  return (
    <div className="scorer">
      <div className="chip-row">
        <button
          type="button"
          className={['chip', entry.shotMoon ? 'chip--active' : null].filter(Boolean).join(' ')}
          onClick={() =>
            set({
              shotMoon: !entry.shotMoon,
              hearts: 0,
              queenOfSpades: false,
            })
          }
        >
          Shoot moon
        </button>
        <button
          type="button"
          className={['chip', !disabled && entry.queenOfSpades ? 'chip--active' : null].filter(Boolean).join(' ')}
          disabled={disabled}
          onClick={() => set({ queenOfSpades: !entry.queenOfSpades })}
        >
          ♠Q +13
        </button>
      </div>

      <div className="stepper-block">
        <span className="field__label">Hearts</span>
        <div className="stepper stepper--lg">
          <button
            type="button"
            className="step step--active"
            disabled={disabled || entry.hearts <= 0}
            onClick={() => set({ hearts: Math.max(0, entry.hearts - 1) })}
            aria-label="Fewer hearts"
          >
            <Minus size={18} />
          </button>
          <input
            className="stepper__value"
            type="number"
            inputMode="numeric"
            disabled={disabled}
            value={entry.hearts}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value || '0', 10)
              set({
                hearts: Number.isFinite(next) ? Math.max(0, Math.min(13, next)) : 0,
              })
            }}
            aria-label="Hearts taken"
          />
          <button
            type="button"
            className="step step--active"
            disabled={disabled || entry.hearts >= 13}
            onClick={() => set({ hearts: Math.min(13, entry.hearts + 1) })}
            aria-label="More hearts"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <p className="scorer__total">
        Round <strong>{score}</strong>
        {entry.shotMoon ? <span className="meta meta--muted"> · moon</span> : null}
      </p>
    </div>
  )
}
