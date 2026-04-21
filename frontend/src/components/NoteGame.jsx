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

function playTone(frequency, audioCtxRef, duration = 1.5) {
  const ctx = getAudioCtx(audioCtxRef)
  if (ctx.state === 'suspended') ctx.resume()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'triangle'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.4, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.start()
  osc.stop(ctx.currentTime + duration)
}

function pickNote(prevName = null) {
  const pool = NOTES.filter(n => n.name !== prevName)
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── MODE SELECT ────────────────────────────────────────────────────────────────

function ModeSelect({ onSelect }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-10 px-6 py-12">
      <div className="text-center">
        <div className="text-8xl mb-4">🎹</div>
        <h1 className="text-4xl font-black text-slate-800">Note Game</h1>
        <p className="text-slate-500 mt-2 text-lg">Listen and find the note!</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        <button
          onClick={() => onSelect('easy')}
          className="flex-1 flex flex-col items-center gap-4 bg-white rounded-2xl shadow-md p-8 border-b-4 border-accent-blue hover:shadow-lg active:border-b-0 active:translate-y-1 transition-all group"
        >
          <div className="w-20 h-20 bg-accent-blue/20 text-accent-blue rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            👁️
          </div>
          <div className="text-center">
            <div className="font-bold text-xl text-slate-700">Easy Mode</div>
            <div className="text-slate-500 mt-1">Press a key to hear it play!</div>
            <div className="text-xs text-accent-blue font-semibold mt-2">Ages 3–5</div>
          </div>
        </button>

        <button
          onClick={() => onSelect('hard')}
          className="flex-1 flex flex-col items-center gap-4 bg-white rounded-2xl shadow-md p-8 border-b-4 border-accent-purple hover:shadow-lg active:border-b-0 active:translate-y-1 transition-all group"
        >
          <div className="w-20 h-20 bg-accent-purple/20 text-accent-purple rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            🙈
          </div>
          <div className="text-center">
            <div className="font-bold text-xl text-slate-700">Hard Mode</div>
            <div className="text-slate-500 mt-1">Keys are silent — trust your ears!</div>
            <div className="text-xs text-accent-purple font-semibold mt-2">Use your ears</div>
          </div>
        </button>
      </div>

      <button onClick={() => navigate('/')} className="text-slate-400 text-sm hover:text-slate-600 transition-colors">
        ← Back to Home
      </button>
    </div>
  )
}

// ── EASY MODE ─────────────────────────────────────────────────────────────────

function EasyMode({ onBack }) {
  const [targetNote, setTargetNote] = useState(() => pickNote())
  const [tries, setTries] = useState(3)
  const [feedback, setFeedback] = useState(null)
  const [pressedKey, setPressedKey] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [scaleNote, setScaleNote] = useState(null) // note name highlighted during scale
  const [playingScale, setPlayingScale] = useState(false)
  const audioCtxRef = useRef(null)
  const timeoutRef = useRef(null)
  const scaleTimersRef = useRef([])
  const { setScore: setSessionScore } = useGameSession('notes')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setSessionScore(score) }, [score])

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

  const playScale = useCallback(() => {
    if (playingScale) return
    setPlayingScale(true)
    scaleTimersRef.current.forEach(clearTimeout)
    scaleTimersRef.current = []

    const STEP = 700
    NOTES.forEach((note, idx) => {
      const t = setTimeout(() => {
        setScaleNote(note.name)
        playTone(note.frequency, audioCtxRef, 0.6)
      }, idx * STEP)
      scaleTimersRef.current.push(t)
    })
    const endT = setTimeout(() => {
      setScaleNote(null)
      setPlayingScale(false)
    }, NOTES.length * STEP + 300)
    scaleTimersRef.current.push(endT)
  }, [playingScale])

  useEffect(() => () => {
    clearTimeout(timeoutRef.current)
    scaleTimersRef.current.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Modes</span>
        </button>
        <h1 className="text-xl font-black text-slate-800">Easy Mode — Note Game</h1>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm font-bold text-slate-700">
          ⭐ {score} / {total}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl flex flex-col items-center gap-6">

          <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">
            Find the note on the piano!
          </p>

          {/* Play note button */}
          <button
            onClick={playTarget}
            className="w-32 h-32 rounded-full bg-accent-purple/20 text-accent-purple flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-accent-purple/30"
          >
            <span className="material-symbols-outlined text-[56px] fill-1">volume_up</span>
            <span className="text-xs font-bold mt-1">Click to hear</span>
          </button>

          {/* Hear the scale button */}
          <button
            onClick={playScale}
            disabled={playingScale}
            className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            <span className="material-symbols-outlined text-base">piano</span>
            {playingScale ? 'Playing scale…' : 'Hear the scale?'}
          </button>

          {/* Scale note display */}
          <div className="h-12 flex items-center justify-center">
            {scaleNote ? (
              <div className="flex items-center gap-3 bg-accent-purple/10 text-accent-purple font-black text-2xl px-8 py-2 rounded-full animate-pulse">
                <span className="material-symbols-outlined">music_note</span>
                {scaleNote}
              </div>
            ) : (
              <div className="h-10" />
            )}
          </div>

          {/* Tries indicator */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm font-medium">Tries left:</span>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-5 h-5 rounded-full transition-colors ${i <= tries ? 'bg-primary' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="h-14 flex items-center justify-center">
            {feedback === 'correct' && (
              <div className="flex items-center gap-2 bg-primary/20 text-green-700 font-bold px-8 py-3 rounded-full text-xl animate-bounce-slight">
                🎉 That's right!
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="flex items-center gap-2 bg-red-100 text-red-600 font-bold px-8 py-3 rounded-full text-lg">
                ❌ Not quite! Try again!
              </div>
            )}
            {feedback === 'reveal' && (
              <div className="flex items-center gap-2 bg-amber-100 text-amber-700 font-bold px-8 py-3 rounded-full text-xl">
                🎵 It was: <span className="text-2xl ml-1">{targetNote.name}</span>
              </div>
            )}
          </div>

          {/* Piano keys */}
          <div className="w-full">
            <div className="flex w-full gap-2" style={{ height: '200px' }}>
              {NOTES.map((note) => {
                const isCorrect = feedback === 'correct' && note.name === targetNote.name
                const isReveal = feedback === 'reveal' && note.name === targetNote.name
                const isWrong = pressedKey === note.name && feedback === 'wrong'
                const isScale = scaleNote === note.name
                return (
                  <button
                    key={note.name}
                    onClick={() => handleGuess(note)}
                    className={`
                      flex-1 rounded-b-2xl flex flex-col items-center justify-end pb-4
                      border-b-4 hover:shadow-md active:border-b-0 active:translate-y-1 transition-all shadow-md font-black text-xl
                      ${isCorrect
                        ? 'bg-primary border-green-600 text-green-800'
                        : isReveal
                        ? 'bg-amber-200 border-amber-500 text-amber-800'
                        : isWrong
                        ? 'bg-red-200 border-red-400 text-red-600'
                        : isScale
                        ? 'bg-accent-purple/40 border-accent-purple text-accent-purple scale-y-105'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
                    `}
                  >
                    {note.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── HARD MODE ─────────────────────────────────────────────────────────────────

function HardMode({ onBack }) {
  const [targetNote, setTargetNote] = useState(() => pickNote())
  const [tries, setTries] = useState(3)
  const [feedback, setFeedback] = useState(null)
  const [pressedKey, setPressedKey] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const audioCtxRef = useRef(null)
  const timeoutRef = useRef(null)
  const { setScore: setSessionScore } = useGameSession('notes')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setSessionScore(score) }, [score])

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

    setPressedKey(note.name)

    if (note.name === targetNote.name) {
      playTone(note.frequency, audioCtxRef)
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

  // Keyboard input: C D E F G A B keys map directly to notes
  useEffect(() => {
    const handler = (e) => {
      if (e.repeat) return
      const note = NOTES.find(n => n.name === e.key.toUpperCase())
      if (note) handleGuess(note)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleGuess])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Modes</span>
        </button>
        <h1 className="text-xl font-black text-slate-800">Hard Mode — Note Game</h1>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm font-bold text-slate-700">
          ⭐ {score} / {total}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl flex flex-col items-center gap-6">

          <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">
            Name that note!
          </p>

          {/* Play note button */}
          <button
            onClick={playTarget}
            className="w-32 h-32 rounded-full bg-accent-purple/20 text-accent-purple flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform border-4 border-accent-purple/30"
          >
            <span className="material-symbols-outlined text-[56px] fill-1">volume_up</span>
            <span className="text-xs font-bold mt-1">Click to hear</span>
          </button>

          {/* Keyboard hint */}
          <p className="text-slate-400 text-sm">
            Click a button <span className="text-slate-500 font-medium">or press a key</span> on your keyboard (C D E F G A B)
          </p>

          {/* Tries indicator */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm font-medium">Tries left:</span>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-5 h-5 rounded-full transition-colors ${i <= tries ? 'bg-primary' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="h-14 flex items-center justify-center">
            {feedback === 'correct' && (
              <div className="flex items-center gap-2 bg-primary/20 text-green-700 font-bold px-8 py-3 rounded-full text-xl animate-bounce-slight">
                🎉 That's right!
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="flex items-center gap-2 bg-red-100 text-red-600 font-bold px-8 py-3 rounded-full text-lg">
                ❌ Not quite! Try again!
              </div>
            )}
            {feedback === 'reveal' && (
              <div className="flex items-center gap-2 bg-amber-100 text-amber-700 font-bold px-8 py-3 rounded-full text-xl">
                🎵 It was: <span className="text-2xl ml-1">{targetNote.name}</span>
              </div>
            )}
          </div>

          {/* Piano keys (no audio feedback) */}
          <div className="w-full">
            <div className="flex w-full gap-2" style={{ height: '200px' }}>
              {NOTES.map((note) => {
                const isCorrect = feedback === 'correct' && note.name === targetNote.name
                const isReveal = feedback === 'reveal' && note.name === targetNote.name
                const isWrong = pressedKey === note.name && feedback === 'wrong'
                return (
                  <button
                    key={note.name}
                    onClick={() => handleGuess(note)}
                    className={`
                      flex-1 rounded-b-2xl flex flex-col items-center justify-end pb-4
                      border-b-4 hover:shadow-md active:border-b-0 active:translate-y-1 transition-all shadow-md font-black text-xl
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
        </div>
      </main>
    </div>
  )
}

// ── ROOT ───────────────────────────────────────────────────────────────────────

export default function NoteGame() {
  const [mode, setMode] = useState(null)

  return (
    <div className="bg-gradient-to-br from-purple-100 to-blue-50 min-h-screen flex flex-col font-display text-slate-900 antialiased">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent-purple/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {mode === null && <ModeSelect onSelect={setMode} />}
        {mode === 'easy' && <EasyMode onBack={() => setMode(null)} />}
        {mode === 'hard' && <HardMode onBack={() => setMode(null)} />}
      </div>
    </div>
  )
}
