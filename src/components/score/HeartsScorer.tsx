import type { HeartsEntry } from '../../types'
import PointStepper from './PointStepper'

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

      <PointStepper
        label="Hearts"
        value={entry.hearts}
        min={0}
        max={13}
        quickAdds={[1, 3, 5]}
        disabled={disabled}
        onChange={(hearts) => set({ hearts })}
      />

      <p className="scorer__total">
        Round <strong>{score}</strong>
        {entry.shotMoon ? <span className="meta meta--muted"> · moon</span> : null}
      </p>
    </div>
  )
}
