import type { ReactNode } from 'react'

type AppShellProps = {
  header: ReactNode
  children: ReactNode
  footer?: ReactNode
  centered?: boolean
}

export default function AppShell({
  header,
  children,
  footer,
  centered = false,
}: AppShellProps) {
  return (
    <div className="app-shell">
      {header}
      <main className={`app-main${centered ? ' app-main--centered' : ''}`}>
        <div className="shell-inner">
          <div className="page">{children}</div>
        </div>
      </main>
      {footer ? (
        <div className="sticky-action">
          <div className="sticky-action-inner">{footer}</div>
        </div>
      ) : null}
    </div>
  )
}
