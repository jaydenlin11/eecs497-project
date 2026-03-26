import { useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

/**
 * Tracks how long a child plays a game and reports the session on unmount.
 * @param {string} gameName  - one of: 'math', 'notes', 'animals', 'whackamole'
 * @returns {{ setScore: (n: number) => void }}
 */
export function useGameSession(gameName) {
  const { activeChild, token } = useAuth()
  const startTimeRef = useRef(Date.now())
  const scoreRef = useRef(0)

  const setScore = (n) => { scoreRef.current = n }

  useEffect(() => {
    startTimeRef.current = Date.now()
    return () => {
      if (!token || !activeChild) return
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
      if (duration < 5) return // skip sessions that were too short to be meaningful
      api.createSession({
        child_id: activeChild.id,
        game: gameName,
        score: scoreRef.current,
        duration_seconds: duration,
      }).catch(() => {}) // fire-and-forget; don't block navigation
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { setScore }
}
