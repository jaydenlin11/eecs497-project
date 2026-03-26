import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ProfileSelect from './components/ProfileSelect'
import Home from './components/Home'
import GameScreen from './components/GameScreen'
import Insights from './components/Insights'
import AnimalGame from './components/AnimalGame'
import MathGame from './components/MathGame'
import NoteGame from './components/NoteGame'
import WhackaMoleGame from './components/WhackaMoleGame'

/** Requires a valid JWT. If missing, redirects to /login. */
function RequireAuth({ children }) {
  const { token, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-display text-lg">Loading…</div>
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

/** Requires an active child profile. If missing, redirects to /select. */
function RequireChild({ children }) {
  const { activeChild, loading } = useAuth()
  if (loading) return null
  if (!activeChild) return <Navigate to="/select" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Profile selector — needs login but no active child */}
          <Route path="/select" element={
            <RequireAuth><ProfileSelect /></RequireAuth>
          } />

          {/* Parent insights — needs login but NOT necessarily an active child */}
          <Route path="/insights" element={
            <RequireAuth><Insights /></RequireAuth>
          } />

          {/* Child-facing routes — need both login and active child */}
          <Route path="/" element={
            <RequireAuth><RequireChild><Home /></RequireChild></RequireAuth>
          } />
          <Route path="/game" element={
            <RequireAuth><RequireChild><GameScreen /></RequireChild></RequireAuth>
          } />
          <Route path="/game/animals" element={
            <RequireAuth><RequireChild><AnimalGame /></RequireChild></RequireAuth>
          } />
          <Route path="/game/math" element={
            <RequireAuth><RequireChild><MathGame /></RequireChild></RequireAuth>
          } />
          <Route path="/game/notes" element={
            <RequireAuth><RequireChild><NoteGame /></RequireChild></RequireAuth>
          } />
          <Route path="/game/whackamole" element={
            <RequireAuth><RequireChild><WhackaMoleGame /></RequireChild></RequireAuth>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
