import PointStepper from './PointStepper'

type SimpleScorerProps = {
  points: number
  onChange: (points: number) => void
  label?: string
  compact?: boolean
}

export default function SimpleScorer({
  points,
  onChange,
  label = 'Points this round',
  compact = false,
}: SimpleScorerProps) {
  return (
    <div className={compact ? 'scorer scorer--compact' : 'scorer'}>
      <PointStepper value={points} onChange={onChange} label={compact ? undefined : label} />
      {!compact ? (
        <p className="scorer__total">
          Round <strong>{points}</strong>
        </p>
      ) : null}
    </div>
  )
}
