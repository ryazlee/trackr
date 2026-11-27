import { Minus, Plus } from 'lucide-react'

type SimpleScorerProps = {
  points: number
  onChange: (points: number) => void
}

export default function SimpleScorer({ points, onChange }: SimpleScorerProps) {
  return (
    <div className="scorer">
      <div className="stepper-block">
        <span className="field__label">Points</span>
        <div className="stepper stepper--lg">
          <button
            type="button"
            className="step step--active"
            onClick={() => onChange(points - 1)}
            aria-label="Decrease points"
          >
            <Minus size={18} />
          </button>
          <input
            className="stepper__value"
            type="number"
            inputMode="numeric"
            value={points}
            onChange={(event) => {
              const next = Number.parseInt(event.target.value || '0', 10)
              onChange(Number.isFinite(next) ? next : 0)
            }}
            aria-label="Points"
          />
          <button
            type="button"
            className="step step--active"
            onClick={() => onChange(points + 1)}
            aria-label="Increase points"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
