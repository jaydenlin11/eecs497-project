import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../hooks/useGameSession'

const NOTES = [
  { name: 'C', frequency: 261.63 },
  { name: 'D', frequency: 293.66 },
  { name: 'E', frequency: 329.63 },
  { name: 'F', frequency: 349.23 },
  { name: 'G', frequency: 392.00 },
  { name: 'A', frequency: 440.00 },
  { name: 'B', frequency: 493.88 },
]

const KEY_COLORS = [
  'bg-pink-200', 'bg-blue-200', 'bg-yellow-200', 'bg-green-200',
  'bg-purple-200', 'bg-orange-200', 'bg-red-200',
]

function getAudioCtx(ref) {
  if (!ref.current) {
    ref.current = new (window.AudioContext || window.webkitAudioContext)()
  }
  return ref.current
}

function playTone(frequency, audioCtxRef) {
  const ctx = getAudioCtx(audioCtxRef)
  if (ctx.state === 'suspended') ctx.resume()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'triangle'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.4, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)

  osc.start()
  osc.stop(ctx.currentTime + 1.5)
}

function pickNote(prevName = null) {
  const pool = NOTES.filter(n => n.name !== prevName)
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── MODE SELECT ────────────────────────────────────────────────────────────────

function ModeSelect({ onSelect }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6">
      <div className="text-center">
        <div className="text-7xl mb-4">🎹</div>
        <h1 className="text-3xl font-black text-slate-800">Note Game</h1>
        <p className="text-slate-500 mt-2">Listen and find the note!</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => onSelect('easy')}
          className="flex items-center gap-4 bg-white rounded-xl shadow-md p-5 border-b-4 border-accent-blue active:border-b-0 active:translate-y-1 transition-all group"
        >
          <div className="w-14 h-14 bg-accent-blue/20 text-accent-blue rounded-full flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
            👁️
          </div>
          <div className="text-left">
            <div className="font-bold text-lg text-slate-700">Easy Mode</div>
            <div className="text-sm text-slate-500">Piano keys are shown!</div>
            <div className="text-xs text-accent-blue font-semibold mt-0.5">Ages 3–5</div>
          </div>
        </button>

        <button
          onClick={() => onSelect('hard')}
          className="flex items-center gap-4 bg-white rounded-xl shadow-md p-5 border-b-4 border-accent-purple active:border-b-0 active:translate-y-1 transition-all group"
        >
          <div className="w-14 h-14 bg-accent-purple/20 text-accent-purple rounded-full flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
            🙈
          </div>
          <div className="text-left">
            <div className="font-bold text-lg text-slate-700">Hard Mode</div>
            <div className="text-sm text-slate-500">Piano is hidden!</div>
            <div className="text-xs text-accent-purple font-semibold mt-0.5">Use your ears</div>
          </div>
        </button>
      </div>

      <button onClick={() => navigate('/')} className="text-slate-400 text-sm hover:text-slate-600 transition-colors">
        ← Back to Home
      </button>
    </div>
  )
}

// ── GAME MODE (shared easy/hard) ───────────────────────────────────────────────

function GameMode({ showPiano, onBack }) {
  const navigate = useNavigate()
  const [targetNote, setTargetNote] = useState(() => pickNote())
  const [tries, setTries] = useState(3)
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong' | 'reveal'
  const [pressedKey, setPressedKey] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const audioCtxRef = useRef(null)
  const timeoutRef = useRef(null)
  const { setScore: setSessionScore } = useGameSession('notes')

  useEffect(() => { setSessionScore(score) }, [score]) // eslint-disable-line react-hooks/exhaustive-deps

  const playTarget = useCallback(() => {
    playTone(targetNote.frequency, audioCtxRef)
  }, [targetNote])

  const nextRound = useCallback((currentTarget) => {
    setFeedback(null)
    setPressedKey(null)
    setTries(3)
    setTargetNote(pickNote(currentTarget.name))
  }, [])

  const handleGuess = useCallback((note) => {
    if (feedback === 'correct' || feedback === 'reveal') return
    clearTimeout(timeoutRef.current)

    playTone(note.frequency, audioCtxRef)
    setPressedKey(note.name)

    if (note.name === targetNote.name) {
      setScore(s => s + 1)
      setTotal(t => t + 1)
      setFeedback('correct')
      timeoutRef.current = setTimeout(() => nextRound(targetNote), 1500)
    } else {
      const newTries = tries - 1
      if (newTries === 0) {
        setTotal(t => t + 1)
        setFeedback('reveal')
        timeoutRef.current = setTimeout(() => nextRound(targetNote), 2500)
      } else {
        setTries(newTries)
        setFeedback('wrong')
        timeoutRef.current = setTimeout(() => {
          setFeedback(null)
          setPressedKey(null)
        }, 800)
      }
    }
  }, [feedback, targetNote, tries, nextRound])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <button onClick={onBack} className="w-10 h-10 bg-white/70 rounded-full flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
        </button>
        <div className="bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm font-bold text-slate-700">
          ⭐ {score} / {total}
        </div>
        <button onClick={() => navigate('/')} className="w-10 h-10 bg-white/70 rounded-full flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-slate-500">home</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">
          {showPiano ? 'Find the note on the piano!' : 'Name that note!'}
        </p>

        {/* Play note button */}
        <button
          onClick={playTarget}
          className="w-28 h-28 rounded-full bg-accent-purple/20 text-accent-purple flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-accent-purple/30"
        >
          <span className="material-symbols-outlined text-[48px] fill-1">volume_up</span>
          <span className="text-xs font-bold mt-1">Tap to hear</span>
        </button>

        {/* Tries indicator */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-sm font-medium">Tries left:</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-colors ${i <= tries ? 'bg-primary' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="h-14 flex items-center justify-center">
          {feedback === 'correct' && (
            <div className="flex items-center gap-2 bg-primary/20 text-green-700 font-bold px-6 py-3 rounded-full text-lg animate-bounce-slight">
              🎉 That's right!
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="flex items-center gap-2 bg-red-100 text-red-600 font-bold px-6 py-3 rounded-full">
              ❌ Not quite! Try again!
            </div>
          )}
          {feedback === 'reveal' && (
            <div className="flex items-center gap-2 bg-amber-100 text-amber-700 font-bold px-6 py-3 rounded-full text-lg">
              🎵 It was: <span className="text-2xl ml-1">{targetNote.name}</span>
            </div>
          )}
        </div>

        {/* Piano keys (easy mode) */}
        {showPiano && (
          <div className="w-full mt-2">
            <div className="flex w-full gap-1.5" style={{ height: '160px' }}>
              {NOTES.map((note) => {
                const isCorrect = feedback === 'correct' && note.name === targetNote.name
                const isReveal = feedback === 'reveal' && note.name === targetNote.name
                const isWrong = pressedKey === note.name && feedback === 'wrong'
                return (
                  <button
                    key={note.name}
                    onClick={() => handleGuess(note)}
                    className={`
                      flex-1 rounded-b-2xl flex flex-col items-center justify-end pb-3
                      border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-md font-black text-lg
                      ${isCorrect
                        ? 'bg-primary border-green-600 text-green-800'
                        : isReveal
                        ? 'bg-amber-200 border-amber-500 text-amber-800'
                        : isWrong
                        ? 'bg-red-200 border-red-400 text-red-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                    `}
                  >
                    {note.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Note name buttons (hard mode) */}
        {!showPiano && (
          <div className="flex flex-wrap gap-3 justify-center w-full max-w-xs">
            {NOTES.map((note, idx) => {
              const isCorrect = feedback === 'correct' && note.name === targetNote.name
              const isReveal = feedback === 'reveal' && note.name === targetNote.name
              const isWrong = pressedKey === note.name && feedback === 'wrong'
              return (
                <button
                  key={note.name}
                  onClick={() => handleGuess(note)}
                  className={`
                    w-16 h-16 rounded-xl font-black text-2xl
                    border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-md
                    ${isCorrect
                      ? 'bg-primary border-green-600 text-green-800'
                      : isReveal
                      ? 'bg-amber-200 border-amber-500 text-amber-800'
                      : isWrong
                      ? 'bg-red-200 border-red-400 text-red-600'
                      : `${KEY_COLORS[idx % KEY_COLORS.length]} border-slate-200 text-slate-700`}
                  `}
                >
                  {note.name}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── ROOT ───────────────────────────────────────────────────────────────────────

export default function NoteGame() {
  const [mode, setMode] = useState(null)

  return (
    <div className="bg-gradient-to-b from-purple-100 to-blue-50 font-display text-slate-900 antialiased">
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 -left-10 w-32 h-32 bg-white/40 rounded-full blur-xl" />
          <div className="absolute top-40 -right-10 w-48 h-48 bg-accent-purple/20 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col flex-1">
          {mode === null && <ModeSelect onSelect={setMode} />}
          {mode === 'easy' && <GameMode showPiano={true} onBack={() => setMode(null)} />}
          {mode === 'hard' && <GameMode showPiano={false} onBack={() => setMode(null)} />}
        </div>
      </div>
    </div>
  )
}
