import { useEffect } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import HomeScreen from './components/screens/HomeScreen'
import SetupScreen from './components/screens/SetupScreen'
import GameScreen from './components/screens/GameScreen'
import { ThemeProvider } from './theme'
import { useSessions } from './hooks/useSessions'
import { getGameById } from './utils/storage'
import { trackPageview } from './utils/analytics'
import type { Session } from './types'

function getRouterBasename(): string {
  const base = import.meta.env.BASE_URL
  return base.endsWith('/') ? base.slice(0, -1) : base
}

function RouteAnalytics() {
  const location = useLocation()

  useEffect(() => {
    trackPageview()
  }, [location.pathname])

  return null
}

function PlayRoute({
  sessions,
  onUpdate,
  onDelete,
}: {
  sessions: Session[]
  onUpdate: (session: Session) => void
  onDelete: (sessionId: string) => void
}) {
  const { sessionId = '' } = useParams()
  const navigate = useNavigate()
  const session = sessions.find((item) => item.id === sessionId)
  const game = session ? getGameById(session.gameId) : undefined

  if (!session || !game) {
    return <Navigate to="/" replace />
  }

  return (
    <GameScreen
      session={session}
      game={game}
      onUpdate={onUpdate}
      onDelete={() => {
        onDelete(session.id)
        navigate('/')
      }}
    />
  )
}

function AppRoutes() {
  const { sessions, save, remove } = useSessions()

  return (
    <Routes>
      <Route
        path="/"
        element={<HomeScreen sessions={sessions} onDeleteSession={remove} />}
      />
      <Route path="/new" element={<SetupScreen onCreate={save} />} />
      <Route
        path="/play/:sessionId"
        element={
          <PlayRoute sessions={sessions} onUpdate={save} onDelete={remove} />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={getRouterBasename() || undefined}>
        <RouteAnalytics />
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}
