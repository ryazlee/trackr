import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

const DEFAULT_QUICK = [1, 5, 10, 25] as const

type PointStepperProps = {
  value: number
  onChange: (value: number) => void
  label?: string
  min?: number
  max?: number
  /** Quick-add amounts shown as chips (also mirrored as negatives). */
  quickAdds?: readonly number[]
  disabled?: boolean
}

function clamp(value: number, min?: number, max?: number): number {
  let next = value
  if (typeof min === 'number') next = Math.max(min, next)
  if (typeof max === 'number') next = Math.min(max, next)
  return next
}

export default function PointStepper({
  value,
  onChange,
  label = 'Points',
  min,
  max,
  quickAdds = DEFAULT_QUICK,
  disabled = false,
}: PointStepperProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))

  const commit = (raw: string) => {
    if (raw.trim() === '' || raw === '-' || raw === '+') {
      onChange(clamp(0, min, max))
      setDraft('0')
      setEditing(false)
      return
    }
    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed)) {
      setDraft(String(value))
      setEditing(false)
      return
    }
    const next = clamp(parsed, min, max)
    onChange(next)
    setDraft(String(next))
    setEditing(false)
  }

  const bump = (delta: number) => {
    const next = clamp(value + delta, min, max)
    onChange(next)
    setDraft(String(next))
    setEditing(false)
  }

  return (
    <div className="stepper-block">
      {label ? <span className="field__label">{label}</span> : null}
      <div className="stepper stepper--lg">
        <button
          type="button"
          className="step step--active"
          disabled={disabled || (typeof min === 'number' && value <= min)}
          onClick={() => bump(-1)}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus size={18} />
        </button>
        <input
          className="stepper__value"
          type="text"
          inputMode="numeric"
          pattern="-?[0-9]*"
          disabled={disabled}
          value={editing ? draft : String(value)}
          onFocus={() => {
            setDraft(String(value))
            setEditing(true)
          }}
          onChange={(event) => {
            const next = event.target.value
            if (next === '' || /^-?\d*$/.test(next)) {
              setDraft(next)
            }
          }}
          onBlur={() => commit(draft)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit(draft)
              ;(event.target as HTMLInputElement).blur()
            }
          }}
          aria-label={label}
        />
        <button
          type="button"
          className="step step--active"
          disabled={disabled || (typeof max === 'number' && value >= max)}
          onClick={() => bump(1)}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="chip-row chip-row--quick">
        {quickAdds.map((amount) => (
          <button
            key={`m${amount}`}
            type="button"
            className="chip chip--quick"
            disabled={disabled}
            onClick={() => bump(-amount)}
          >
            −{amount}
          </button>
        ))}
        {quickAdds.map((amount) => (
          <button
            key={`p${amount}`}
            type="button"
            className="chip chip--quick"
            disabled={disabled}
            onClick={() => bump(amount)}
          >
            +{amount}
          </button>
        ))}
      </div>
    </div>
  )
}
