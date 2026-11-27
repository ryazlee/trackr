import { FLIP7_MODIFIERS } from '../../games/scoring'
import type { Flip7Entry } from '../../types'
import PointStepper from './PointStepper'

type Flip7ScorerProps = {
  entry: Flip7Entry
  onChange: (entry: Flip7Entry) => void
  score: number
}

export default function Flip7Scorer({ entry, onChange, score }: Flip7ScorerProps) {
  const set = (patch: Partial<Flip7Entry>) => onChange({ ...entry, ...patch })

  const toggleModifier = (value: number) => {
    const has = entry.modifiers.includes(value)
    set({
      modifiers: has
        ? entry.modifiers.filter((item) => item !== value)
        : [...entry.modifiers, value].sort((a, b) => a - b),
    })
  }

  return (
    <div className="scorer">
      <div className="chip-row">
        <button
          type="button"
          className={['chip', entry.bust ? 'chip--danger' : null].filter(Boolean).join(' ')}
          onClick={() => set({ bust: !entry.bust })}
        >
          Bust
        </button>
        <button
          type="button"
          className={['chip', !entry.bust && entry.x2 ? 'chip--active' : null].filter(Boolean).join(' ')}
          disabled={entry.bust}
          onClick={() => set({ x2: !entry.x2 })}
        >
          ×2
        </button>
        <button
          type="button"
          className={['chip', !entry.bust && entry.flip7Bonus ? 'chip--active' : null].filter(Boolean).join(' ')}
          disabled={entry.bust}
          onClick={() => set({ flip7Bonus: !entry.flip7Bonus })}
        >
          Flip 7 +15
        </button>
      </div>

      <PointStepper
        label="Number cards"
        value={entry.numberSum}
        min={0}
        quickAdds={[1, 5, 10]}
        disabled={entry.bust}
        onChange={(numberSum) => set({ numberSum })}
      />

      <div className="chip-row">
        {FLIP7_MODIFIERS.map((value) => {
          const active = entry.modifiers.includes(value)
          return (
            <button
              key={value}
              type="button"
              className={['chip', !entry.bust && active ? 'chip--active' : null].filter(Boolean).join(' ')}
              disabled={entry.bust}
              onClick={() => toggleModifier(value)}
            >
              +{value}
            </button>
          )
        })}
      </div>

      <p className="scorer__total">
        Round <strong>{score}</strong>
      </p>
    </div>
  )
}
