type GoatCounter = {
  count: (vars?: { path?: string; title?: string; event?: boolean; referrer?: string }) => void
}

declare global {
  interface Window {
    goatcounter?: GoatCounter
  }
}

/** Pathname only — never send session payloads or hashes. */
export function trackPageview(path = window.location.pathname): void {
  try {
    window.goatcounter?.count({ path })
  } catch {
    // Analytics should never break the app.
  }
}
