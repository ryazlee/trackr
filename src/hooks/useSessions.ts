import { useCallback, useState } from 'react'
import type { Session } from '../types'
import { deleteSession, loadSessions, upsertSession } from '../utils/storage'

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions())

  const save = useCallback((session: Session) => {
    setSessions(upsertSession(session))
  }, [])

  const remove = useCallback((sessionId: string) => {
    setSessions(deleteSession(sessionId))
  }, [])

  const refresh = useCallback(() => {
    setSessions(loadSessions())
  }, [])

  return { sessions, save, remove, refresh }
}
