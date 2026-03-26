import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../hooks/useGameSession'

const ANIMALS = [
  { name: 'Dog', emoji: '🐶' },
  { name: 'Cat', emoji: '🐱' },
  { name: 'Cow', emoji: '🐮' },
  { name: 'Pig', emoji: '🐷' },
  { name: 'Frog', emoji: '🐸' },
  { name: 'Lion', emoji: '🦁' },
  { name: 'Bear', emoji: '🐻' },
  { name: 'Elephant', emoji: '🐘' },
  { name: 'Giraffe', emoji: '🦒' },
  { name: 'Penguin', emoji: '🐧' },
  { name: 'Fox', emoji: '🦊' },
  { name: 'Duck', emoji: '🦆' },
  { name: 'Rabbit', emoji: '🐰' },
  { name: 'Monkey', emoji: '🐒' },
  { name: 'Horse', emoji: '🐴' },
  { name: 'Tiger', emoji: '🐯' },
  { name: 'Zebra', emoji: '🦓' },
  { name: 'Turtle', emoji: '🐢' },
]

// Distinct background colors for click mode animal cards
const CARD_COLORS = [
  'bg-pink-200', 'bg-blue-200', 'bg-yellow-200',
  'bg-green-200', 'bg-purple-200', 'bg-orange-200',
]

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pickRound(previousName) {
  const pool = ANIMALS.filter(a => a.name !== previousName)
  const target = pool[Math.floor(Math.random() * pool.length)]
  const distractors = shuffle(ANIMALS.filter(a => a.name !== target.name))
  const choices = shuffle([target, ...distractors.slice(0, 5)])
  return { target, choices }
}

// ── MODE SELECTION ──────────────────────────────────────────────────────────

function ModeSelect({ onSelect }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6">
      <div className="text-center">
        <div className="text-7xl mb-4">🐾</div>
        <h1 className="text-3xl font-black text-slate-800">Animal Game</h1>
        <p className="text-slate-500 mt-2">Pick how you want to play!</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => onSelect('click')}
          className="flex items-center gap-4 bg-white rounded-xl shadow-md p-5 border-b-4 border-accent-blue active:border-b-0 active:translate-y-1 transition-all group"
        >
          <div className="w-14 h-14 bg-accent-blue/20 text-accent-blue rounded-full flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
            👆
          </div>
          <div className="text-left">
            <div className="font-bold text-lg text-slate-700">Click Mode</div>
            <div className="text-sm text-slate-500">Find and tap the animal!</div>
            <div className="text-xs text-accent-blue font-semibold mt-0.5">Ages 0–2</div>
          </div>
        </button>

        <button
          onClick={() => onSelect('audio')}
          className="flex items-center gap-4 bg-white rounded-xl shadow-md p-5 border-b-4 border-primary active:border-b-0 active:translate-y-1 transition-all group"
        >
          <div className="w-14 h-14 bg-primary/20 text-green-600 rounded-full flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
            🎤
          </div>
          <div className="text-left">
            <div className="font-bold text-lg text-slate-700">Say It Mode</div>
            <div className="text-sm text-slate-500">Name the animal out loud!</div>
            <div className="text-xs text-green-600 font-semibold mt-0.5">Voice recognition</div>
          </div>
        </button>
      </div>

      <button onClick={() => navigate('/')} className="text-slate-400 text-sm hover:text-slate-600 transition-colors">
        ← Back to Home
      </button>
    </div>
  )
}

// ── CLICK MODE ───────────────────────────────────────────────────────────────

function ClickMode({ onBack }) {
  const navigate = useNavigate()
  const [round, setRound] = useState(() => pickRound(null))
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [wrongIdx, setWrongIdx] = useState(null)
  const timeoutRef = useRef(null)
  const { setScore: setSessionScore } = useGameSession('animals')

  useEffect(() => { setSessionScore(score) }, [score]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePick = useCallback((animal, idx) => {
    if (feedback) return
    const isCorrect = animal.name === round.target.name
    setTotal(t => t + 1)
    if (isCorrect) {
      setScore(s => s + 1)
      setFeedback('correct')
      timeoutRef.current = setTimeout(() => {
        setFeedback(null)
        setWrongIdx(null)
        setRound(pickRound(round.target.name))
      }, 1400)
    } else {
      setWrongIdx(idx)
      setFeedback('wrong')
      timeoutRef.current = setTimeout(() => {
        setFeedback(null)
        setWrongIdx(null)
      }, 900)
    }
  }, [feedback, round])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
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

      {/* Prompt */}
      <div className="px-6 pb-4 text-center">
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Find the animal!</p>
        <div className="inline-flex items-center bg-white rounded-2xl shadow-md px-6 py-3">
          <span className="text-3xl font-black text-slate-800">{round.target.name}</span>
        </div>
      </div>

      {/* Animal grid */}
      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {round.choices.map((animal, idx) => {
            const isWrong = wrongIdx === idx
            const isTarget = feedback === 'correct' && animal.name === round.target.name
            return (
              <button
                key={`${animal.name}-${idx}`}
                onClick={() => handlePick(animal, idx)}
                className={`
                  flex flex-col items-center justify-center rounded-xl aspect-square text-5xl shadow-md
                  border-b-4 active:border-b-0 active:translate-y-1 transition-all duration-150
                  ${CARD_COLORS[idx % CARD_COLORS.length]}
                  ${isTarget ? 'ring-4 ring-primary scale-105' : ''}
                  ${isWrong ? 'ring-4 ring-red-400 scale-95' : ''}
                  border-black/10
                `}
              >
                <span className={`select-none transition-transform duration-200 ${isWrong ? 'opacity-50' : ''}`}>
                  {animal.emoji}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Feedback overlay */}
      {feedback === 'correct' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-white rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center gap-2 animate-bounce-slight">
            <div className="text-6xl">🎉</div>
            <div className="text-2xl font-black text-primary">Great job!</div>
          </div>
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none z-30">
          <div className="bg-white rounded-2xl shadow-lg px-6 py-3 text-slate-600 font-semibold">
            Try again! 🔍
          </div>
        </div>
      )}
    </div>
  )
}

// ── AUDIO MODE ───────────────────────────────────────────────────────────────

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

function AudioMode({ onBack }) {
  const navigate = useNavigate()
  const [animal, setAnimal] = useState(() => ANIMALS[Math.floor(Math.random() * ANIMALS.length)])
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong' | 'error'
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)
  const { setScore: setSessionScore } = useGameSession('animals')

  useEffect(() => { setSessionScore(score) }, [score]) // eslint-disable-line react-hooks/exhaustive-deps

  const nextAnimal = useCallback(() => {
    setFeedback(null)
    setTranscript('')
    setAnimal(prev => {
      const pool = ANIMALS.filter(a => a.name !== prev.name)
      return pool[Math.floor(Math.random() * pool.length)]
    })
  }, [])

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setFeedback('error')
      return
    }
    if (listening) return

    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 3
    recognitionRef.current = rec

    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)

    rec.onresult = (event) => {
      const results = Array.from(event.results[0]).map(r => r.transcript.toLowerCase())
      setTranscript(results[0])
      const correct = results.some(r => r.includes(animal.name.toLowerCase()))
      setTotal(t => t + 1)
      if (correct) {
        setScore(s => s + 1)
        setFeedback('correct')
        timeoutRef.current = setTimeout(nextAnimal, 1600)
      } else {
        setFeedback('wrong')
        timeoutRef.current = setTimeout(() => setFeedback(null), 1600)
      }
    }

    rec.onerror = (e) => {
      setListening(false)
      if (e.error !== 'no-speech') setFeedback('error')
    }

    rec.start()
  }, [listening, animal, nextAnimal])

  useEffect(() => () => {
    clearTimeout(timeoutRef.current)
    recognitionRef.current?.abort()
  }, [])

  const micColor = listening
    ? 'bg-red-400 shadow-[0_8px_30px_rgba(248,113,113,0.6)]'
    : feedback === 'correct'
    ? 'bg-primary shadow-[0_8px_30px_rgba(25,230,107,0.5)]'
    : 'bg-primary shadow-[0_8px_30px_rgba(25,230,107,0.4)]'

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

      {/* Animal display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">What animal is this?</p>

        <div className="w-48 h-48 rounded-3xl bg-white shadow-xl flex items-center justify-center">
          <span className="text-9xl select-none">{animal.emoji}</span>
        </div>

        {/* Transcript display */}
        <div className="h-8 text-slate-500 text-lg font-medium text-center">
          {listening && <span className="animate-pulse">Listening…</span>}
          {!listening && transcript && <span>"{transcript}"</span>}
        </div>

        {/* Feedback */}
        {feedback === 'correct' && (
          <div className="flex items-center gap-2 bg-primary/20 text-green-700 font-bold px-6 py-3 rounded-full text-lg">
            🎉 That's right! It's a {animal.name}!
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="flex items-center gap-2 bg-red-100 text-red-600 font-bold px-6 py-3 rounded-full text-lg">
            🔄 Try again — say "{animal.name}"
          </div>
        )}
        {feedback === 'error' && (
          <div className="flex flex-col items-center gap-2 text-slate-500 text-center">
            <span className="text-2xl">🎙️</span>
            <span className="text-sm">Microphone not available in this browser.<br/>Please try Chrome or Edge.</span>
          </div>
        )}
        {!feedback && !listening && !transcript && (
          <div className="text-slate-400 text-sm">Tap the mic and say the animal name!</div>
        )}

        {/* Sound wave bars (animated while listening) */}
        {listening && (
          <div className="flex items-end gap-1 h-10">
            {[3, 5, 8, 6, 10, 7, 4, 9, 5, 3].map((h, i) => (
              <div
                key={i}
                className="w-2 bg-primary rounded-full animate-pulse"
                style={{ height: `${h * 4}px`, animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        )}

        {/* Mic button */}
        <button
          onClick={startListening}
          disabled={listening || feedback === 'correct'}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-slate-900 transition-all duration-300 active:scale-95 disabled:opacity-60 ${micColor}`}
        >
          <span className="material-symbols-outlined text-[48px] fill-1">
            {listening ? 'mic' : 'mic_none'}
          </span>
        </button>
        <p className="text-slate-400 text-sm">Tap to speak</p>

        {/* Skip button */}
        <button
          onClick={nextAnimal}
          className="text-slate-400 hover:text-slate-600 text-sm underline underline-offset-2 transition-colors"
        >
          Skip this one →
        </button>
      </div>
    </div>
  )
}

// ── ROOT COMPONENT ────────────────────────────────────────────────────────────

export default function AnimalGame() {
  const [mode, setMode] = useState(null) // null | 'click' | 'audio'

  return (
    <div className="bg-gradient-to-b from-sky-100 to-green-50 font-display text-slate-900 antialiased">
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl">

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 -left-10 w-32 h-32 bg-white/40 rounded-full blur-xl" />
          <div className="absolute top-40 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col flex-1">
          {mode === null && <ModeSelect onSelect={setMode} />}
          {mode === 'click' && <ClickMode onBack={() => setMode(null)} />}
          {mode === 'audio' && <AudioMode onBack={() => setMode(null)} />}
        </div>

      </div>
    </div>
  )
}
