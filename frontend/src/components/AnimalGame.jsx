import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../hooks/useGameSession'

const ANIMALS = [
  'Dog', 'Cat', 'Cow', 'Pig', 'Frog', 'Lion',
  'Bear', 'Elephant', 'Giraffe', 'Penguin', 'Fox', 'Duck',
  'Rabbit', 'Monkey', 'Horse', 'Tiger', 'Zebra', 'Turtle',
]

// Local animal photos downloaded into frontend/public/resources/animals.
const ANIMAL_IMAGES = {
  Dog: ['/resources/animals/dog-1.jpg', '/resources/animals/dog-2.jpg', '/resources/animals/dog-3.jpg'],
  Cat: ['/resources/animals/cat-1.jpg', '/resources/animals/cat-2.jpg', '/resources/animals/cat-3.jpg'],
  Cow: ['/resources/animals/cow-1.jpg', '/resources/animals/cow-2.jpg'],
  Pig: ['/resources/animals/pig-1.jpg', '/resources/animals/pig-2.jpg', '/resources/animals/pig-3.jpg'],
  Frog: ['/resources/animals/frog-1.jpg', '/resources/animals/frog-2.jpg'],
  Lion: ['/resources/animals/lion-1.jpg', '/resources/animals/lion-2.jpg'],
  Bear: ['/resources/animals/bear-1.jpg', '/resources/animals/bear-2.jpg', '/resources/animals/bear-3.jpg'],
  Elephant: ['/resources/animals/elephant-1.jpg', '/resources/animals/elephant-2.jpg'],
  Giraffe: ['/resources/animals/giraffe-1.jpg', '/resources/animals/giraffe-2.png'],
  Penguin: ['/resources/animals/penguin-1.jpg', '/resources/animals/penguin-2.jpg'],
  Fox: ['/resources/animals/fox-1.jpg', '/resources/animals/fox-2.jpg', '/resources/animals/fox-3.jpg'],
  Duck: ['/resources/animals/duck-1.jpg', '/resources/animals/duck-2.png', '/resources/animals/duck-3.jpg'],
  Rabbit: ['/resources/animals/rabbit-1.jpg', '/resources/animals/rabbit-2.jpg'],
  Monkey: ['/resources/animals/monkey-1.jpg', '/resources/animals/monkey-2.jpg', '/resources/animals/monkey-3.jpg'],
  Horse: ['/resources/animals/horse-1.jpg', '/resources/animals/horse-2.jpg'],
  Tiger: ['/resources/animals/tiger-1.jpg', '/resources/animals/tiger-2.jpg'],
  Zebra: ['/resources/animals/zebra-1.jpg', '/resources/animals/zebra-2.jpg'],
  Turtle: ['/resources/animals/turtle-1.jpg', '/resources/animals/turtle-2.jpg', '/resources/animals/turtle-3.jpg'],
}

function pickImage(name) {
  const imgs = ANIMAL_IMAGES[name] ?? []
  return imgs.length > 0 ? imgs[Math.floor(Math.random() * imgs.length)] : null
}

function AnimalImage({ name, image, className = '', imageClassName = '', fallbackClassName = 'text-sm' }) {
  const sources = [image, ...(ANIMAL_IMAGES[name] ?? []).filter(src => src !== image)].filter(Boolean)
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(sources.length === 0)

  useEffect(() => {
    setAttempt(0)
    setFailed(sources.length === 0)
  }, [name, image]) // eslint-disable-line react-hooks/exhaustive-deps

  const src = sources[attempt]

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 ${className}`}
      aria-label={name}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          className={imageClassName}
          draggable={false}
          onError={() => {
            if (attempt < sources.length - 1) setAttempt(i => i + 1)
            else setFailed(true)
          }}
        />
      ) : (
        <span className={`${fallbackClassName} select-none text-slate-500 font-bold`} aria-hidden="true">
          Photo unavailable
        </span>
      )}
    </div>
  )
}

const CARD_COLORS = [
  'bg-pink-100', 'bg-blue-100', 'bg-yellow-100',
  'bg-green-100', 'bg-purple-100', 'bg-orange-100',
]

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pickRound(previousName) {
  const pool = ANIMALS.filter(n => n !== previousName)
  const targetName = pool[Math.floor(Math.random() * pool.length)]
  const distractors = shuffle(ANIMALS.filter(n => n !== targetName))
  const choiceNames = shuffle([targetName, ...distractors.slice(0, 5)])
  const choices = choiceNames.map(name => ({ name, image: pickImage(name) }))
  const target = choices.find(c => c.name === targetName)
  return { target, choices }
}

// ── MODE SELECTION ────────────────────────────────────────────────────────────

function ModeSelect({ onSelect }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-10 px-6 py-12">
      <div className="text-center">
        <div className="text-8xl mb-4">🐾</div>
        <h1 className="text-4xl font-black text-slate-800">Animal Game</h1>
        <p className="text-slate-500 mt-2 text-lg">Pick how you want to play!</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        <button
          onClick={() => onSelect('click')}
          className="flex-1 flex flex-col items-center gap-4 bg-white rounded-2xl shadow-md p-8 border-b-4 border-accent-blue hover:shadow-lg active:border-b-0 active:translate-y-1 transition-all group"
        >
          <div className="w-20 h-20 bg-accent-blue/20 text-accent-blue rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            👆
          </div>
          <div className="text-center">
            <div className="font-bold text-xl text-slate-700">Click Mode</div>
            <div className="text-slate-500 mt-1">Find and click the animal!</div>
            <div className="text-xs text-accent-blue font-semibold mt-2">Ages 0–2</div>
          </div>
        </button>

        <button
          onClick={() => onSelect('audio')}
          className="flex-1 flex flex-col items-center gap-4 bg-white rounded-2xl shadow-md p-8 border-b-4 border-primary hover:shadow-lg active:border-b-0 active:translate-y-1 transition-all group"
        >
          <div className="w-20 h-20 bg-primary/20 text-green-600 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            🎤
          </div>
          <div className="text-center">
            <div className="font-bold text-xl text-slate-700">Say It Mode</div>
            <div className="text-slate-500 mt-1">Name the animal out loud!</div>
            <div className="text-xs text-green-600 font-semibold mt-2">Voice recognition</div>
          </div>
        </button>
      </div>

      <button onClick={() => navigate('/')} className="text-slate-400 text-sm hover:text-slate-600 transition-colors">
        ← Back to Home
      </button>
    </div>
  )
}

// ── CLICK MODE ────────────────────────────────────────────────────────────────

function ClickMode({ onBack }) {
  const [round, setRound] = useState(() => pickRound(null))
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [wrongIdx, setWrongIdx] = useState(null)
  const timeoutRef = useRef(null)
  const { setScore: setSessionScore } = useGameSession('animals')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setSessionScore(score) }, [score])

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
    <div className="flex flex-col flex-1 relative">
      <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Modes</span>
        </button>
        <div className="text-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Find the animal!</p>
          <div className="inline-flex items-center bg-white rounded-xl shadow-sm px-5 py-1.5 mt-1">
            <span className="text-2xl font-black text-slate-800">{round.target.name}</span>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm font-bold text-slate-700">
          ⭐ {score} / {total}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl">
          <div className="grid grid-cols-3 gap-4">
            {round.choices.map((animal, idx) => {
              const isWrong = wrongIdx === idx
              const isTarget = feedback === 'correct' && animal.name === round.target.name
              return (
                <button
                  key={`${animal.name}-${idx}`}
                  onClick={() => handlePick(animal, idx)}
                  className={`
                    flex flex-col items-center justify-center rounded-2xl aspect-square shadow-md overflow-hidden
                    border-b-4 hover:shadow-lg active:border-b-0 active:translate-y-1 transition-all duration-150
                    ${CARD_COLORS[idx % CARD_COLORS.length]}
                    ${isTarget ? 'ring-4 ring-primary scale-105' : ''}
                    ${isWrong ? 'ring-4 ring-red-400 scale-95 opacity-60' : ''}
                    border-black/10
                  `}
                >
                  <AnimalImage
                    name={animal.name}
                    image={animal.image}
                    className="w-full h-full"
                    imageClassName="w-full h-full object-cover select-none"
                    fallbackClassName="text-sm"
                  />
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {feedback === 'correct' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-white rounded-3xl shadow-2xl px-14 py-10 flex flex-col items-center gap-2 animate-bounce-slight">
            <div className="text-7xl">🎉</div>
            <div className="text-3xl font-black text-primary">Great job!</div>
          </div>
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none z-30">
          <div className="bg-white rounded-2xl shadow-lg px-8 py-4 text-slate-600 font-semibold text-lg">
            Try again! 🔍
          </div>
        </div>
      )}
    </div>
  )
}

// ── AUDIO MODE ────────────────────────────────────────────────────────────────

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

function AudioMode({ onBack }) {
  const initialName = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const [animal, setAnimal] = useState(initialName)
  const [currentImage, setCurrentImage] = useState(() => pickImage(initialName))
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const recognitionRef = useRef(null)
  const timeoutRef = useRef(null)
  const { setScore: setSessionScore } = useGameSession('animals')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setSessionScore(score) }, [score])

  const nextAnimal = useCallback(() => {
    setFeedback(null)
    setTranscript('')
    setAnimal(prev => {
      const pool = ANIMALS.filter(n => n !== prev)
      const next = pool[Math.floor(Math.random() * pool.length)]
      setCurrentImage(pickImage(next))
      return next
    })
  }, [])

  const startListening = useCallback(() => {
    if (!SpeechRecognition) { setFeedback('error'); return }
    if (listening) return

    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 3
    recognitionRef.current = rec

    rec.onstart = () => setListening(true)
    rec.onend   = () => setListening(false)

    rec.onresult = (event) => {
      const results = Array.from(event.results[0]).map(r => r.transcript.toLowerCase())
      setTranscript(results[0])
      const correct = results.some(r => r.includes(animal.toLowerCase()))
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
      <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Modes</span>
        </button>
        <h1 className="text-xl font-black text-slate-800">Say It Mode</h1>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm font-bold text-slate-700">
          ⭐ {score} / {total}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-12">

          {/* Left: animal photo */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">What animal is this?</p>
            <div className="w-72 h-72 rounded-3xl bg-white shadow-xl overflow-hidden flex items-center justify-center">
              <AnimalImage
                name={animal}
                image={currentImage}
                className="w-full h-full"
                imageClassName="w-full h-full object-cover"
                fallbackClassName="text-sm"
              />
            </div>
          </div>

          {/* Right: mic controls */}
          <div className="flex flex-col items-center gap-5">
            <div className="h-8 text-slate-500 text-lg font-medium text-center">
              {listening && <span className="animate-pulse">Listening…</span>}
              {!listening && transcript && <span>"{transcript}"</span>}
            </div>

            {feedback === 'correct' && (
              <div className="flex items-center gap-2 bg-primary/20 text-green-700 font-bold px-6 py-3 rounded-full text-lg">
                🎉 That's right! It's a {animal}!
              </div>
            )}
            {feedback === 'wrong' && (
              <div className="flex items-center gap-2 bg-red-100 text-red-600 font-bold px-6 py-3 rounded-full text-lg">
                🔄 Try again — say "{animal}"
              </div>
            )}
            {feedback === 'error' && (
              <div className="flex flex-col items-center gap-2 text-slate-500 text-center">
                <span className="text-2xl">🎙️</span>
                <span className="text-sm">Microphone not available in this browser.<br />Please try Chrome or Edge.</span>
              </div>
            )}
            {!feedback && !listening && !transcript && (
              <div className="text-slate-400 text-sm">Click the mic and say the animal name!</div>
            )}

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

            <button
              onClick={startListening}
              disabled={listening || feedback === 'correct'}
              className={`w-28 h-28 rounded-full flex items-center justify-center text-slate-900 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 ${micColor}`}
            >
              <span className="material-symbols-outlined text-[56px] fill-1">
                {listening ? 'mic' : 'mic_none'}
              </span>
            </button>
            <p className="text-slate-400 text-sm">Click to speak</p>

            <button
              onClick={nextAnimal}
              className="text-slate-400 hover:text-slate-600 text-sm underline underline-offset-2 transition-colors"
            >
              Skip this one →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── ROOT COMPONENT ────────────────────────────────────────────────────────────

export default function AnimalGame() {
  const [mode, setMode] = useState(null)

  return (
    <div className="bg-gradient-to-br from-sky-100 to-green-50 min-h-screen flex flex-col font-display text-slate-900 antialiased">

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {mode === null && <ModeSelect onSelect={setMode} />}
        {mode === 'click' && <ClickMode onBack={() => setMode(null)} />}
        {mode === 'audio' && <AudioMode onBack={() => setMode(null)} />}
      </div>

    </div>
  )
}
