import { Minus, Plus } from 'lucide-react'
import { FLIP7_MODIFIERS } from '../../games/scoring'
import type { Flip7Entry } from '../../types'

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

      <div className="stepper-block">
        <span className="field__label">Number cards</span>
        <div className="stepper stepper--lg">
          <button
            type="button"
            className="step step--active"
            disabled={entry.bust || entry.numberSum <= 0}
            onClick={() => set({ numberSum: Math.max(0, entry.numberSum - 1) })}
            aria-label="Decrease number sum"
          >
            <Minus size={18} />
          </button>
          <input
            className="stepper__value"
            type="number"
            inputMode="numeric"
            disabled={entry.bust}
            value={entry.numberSum}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value || '0', 10)
              set({ numberSum: Number.isFinite(next) ? Math.max(0, next) : 0 })
            }}
            aria-label="Sum of number cards"
          />
          <button
            type="button"
            className="step step--active"
            disabled={entry.bust}
            onClick={() => set({ numberSum: entry.numberSum + 1 })}
            aria-label="Increase number sum"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

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
