import type { ReactNode } from 'react'

type SectionCardProps = {
  title?: string
  hint?: string
  children: ReactNode
  flush?: boolean
  muted?: boolean
}

export default function SectionCard({
  title,
  hint,
  children,
  flush = false,
  muted = false,
}: SectionCardProps) {
  return (
    <section className={['surface-card', muted ? 'surface-card--muted' : null].filter(Boolean).join(' ')}>
      {title ? (
        <div className="surface-card__header">
          <p className="section-label">{title}</p>
          {hint ? <p>{hint}</p> : null}
        </div>
      ) : null}
      <div className={['surface-card__body', flush ? 'surface-card__body--flush' : null].filter(Boolean).join(' ')}>
        {children}
      </div>
    </section>
  )
}
