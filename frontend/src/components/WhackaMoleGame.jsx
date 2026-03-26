import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../hooks/useGameSession'

const LEVELS = [
  {
    id: 1,
    name: 'Farm Friends',
    emoji: '🌾',
    color: 'bg-yellow-400',
    items: [
      { name: 'Cow', emoji: '🐄' },
      { name: 'Pig', emoji: '🐷' },
      { name: 'Chicken', emoji: '🐔' },
      { name: 'Sheep', emoji: '🐑' },
      { name: 'Horse', emoji: '🐴' },
    ],
  },
  {
    id: 2,
    name: 'Ocean Pals',
    emoji: '🌊',
    color: 'bg-blue-400',
    items: [
      { name: 'Fish', emoji: '🐟' },
      { name: 'Crab', emoji: '🦀' },
      { name: 'Octopus', emoji: '🐙' },
      { name: 'Whale', emoji: '🐳' },
      { name: 'Dolphin', emoji: '🐬' },
    ],
  },
  {
    id: 3,
    name: 'On the Road',
    emoji: '🚗',
    color: 'bg-red-400',
    items: [
      { name: 'Car', emoji: '🚗' },
      { name: 'Bus', emoji: '🚌' },
      { name: 'Truck', emoji: '🚚' },
      { name: 'Plane', emoji: '✈️' },
      { name: 'Boat', emoji: '⛵' },
    ],
  },
  {
    id: 4,
    name: 'Yummy Fruits',
    emoji: '🍎',
    color: 'bg-green-400',
    items: [
      { name: 'Apple', emoji: '🍎' },
      { name: 'Banana', emoji: '🍌' },
      { name: 'Orange', emoji: '🍊' },
      { name: 'Grapes', emoji: '🍇' },
      { name: 'Mango', emoji: '🥭' },
    ],
  },
  {
    id: 5,
    name: 'Cool Bugs',
    emoji: '🐛',
    color: 'bg-purple-400',
    items: [
      { name: 'Butterfly', emoji: '🦋' },
      { name: 'Bee', emoji: '🐝' },
      { name: 'Ladybug', emoji: '🐞' },
      { name: 'Ant', emoji: '🐜' },
      { name: 'Caterpillar', emoji: '🐛' },
    ],
  },
]

const GAME_DURATION = 30
const SCORE_TO_UNLOCK = 5
const MOLE_VISIBLE_MS = 1800
const POP_INTERVAL_MS = 900

// ── LEVEL SELECT ───────────────────────────────────────────────────────────────

function LevelSelect({ unlockedLevels, onSelect }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col flex-1 px-6 pt-10 pb-6">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-white/70 rounded-full flex items-center justify-center shadow-sm shrink-0"
        >
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
        </button>
        <h1 className="text-2xl font-black text-slate-800">Whack-a-Mole!</h1>
      </div>

      <p className="text-slate-500 mb-4 pl-1">Choose a level:</p>

      <div className="flex flex-col gap-3 overflow-y-auto">
        {LEVELS.map(level => {
          const unlocked = unlockedLevels.includes(level.id)
          return (
            <button
              key={level.id}
              onClick={() => unlocked && onSelect(level)}
              disabled={!unlocked}
              className={`
                flex items-center gap-4 rounded-xl p-4 shadow-sm border-b-4 transition-all text-left
                ${unlocked
                  ? 'bg-white active:border-b-0 active:translate-y-1 border-slate-200 hover:shadow-md'
                  : 'bg-slate-100 border-slate-100 opacity-60 cursor-not-allowed'}
              `}
            >
              <div className={`w-14 h-14 ${level.color} rounded-full flex items-center justify-center text-3xl shrink-0`}>
                {level.emoji}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-700">Level {level.id}: {level.name}</div>
                <div className="text-sm text-slate-500">{level.items.length} things to learn</div>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-2xl">
                {unlocked ? 'play_arrow' : 'lock'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── LEARN PHASE ────────────────────────────────────────────────────────────────

function LearnPhase({ level, onDone, onBack }) {
  const navigate = useNavigate()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showReady, setShowReady] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (currentIdx < level.items.length - 1) {
      timeoutRef.current = setTimeout(() => setCurrentIdx(i => i + 1), 2000)
    } else {
      timeoutRef.current = setTimeout(() => setShowReady(true), 2000)
    }
    return () => clearTimeout(timeoutRef.current)
  }, [currentIdx, level.items.length])

  if (showReady) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6 gap-6">
        <div className="text-5xl">🧠</div>
        <h2 className="text-2xl font-black text-slate-800 text-center">Remember these?</h2>
        <div className="flex justify-center gap-4 flex-wrap w-full max-w-xs">
          {level.items.map(item => (
            <div key={item.name} className="flex flex-col items-center gap-1">
              <div className="text-4xl">{item.emoji}</div>
              <div className="text-xs font-bold text-slate-600">{item.name}</div>
            </div>
          ))}
        </div>
        <button
          onClick={onDone}
          className="bg-primary text-slate-900 font-black text-xl px-10 py-4 rounded-2xl shadow-lg border-b-4 border-green-600 active:border-b-0 active:translate-y-1 transition-all hover:scale-105"
        >
          Let's Go! 🎯
        </button>
        <button onClick={onBack} className="text-slate-400 text-sm hover:text-slate-600 transition-colors">
          ← Back to levels
        </button>
        <button onClick={() => navigate('/')} className="text-slate-400 text-sm hover:text-slate-600 transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-lg">home</span> Home
        </button>
      </div>
    )
  }

  const item = level.items[currentIdx]
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 gap-6">
      <div className="text-slate-500 font-medium uppercase tracking-wider text-sm">Get ready!</div>
      <div className="w-44 h-44 rounded-3xl bg-white shadow-xl flex items-center justify-center">
        <span className="text-8xl">{item.emoji}</span>
      </div>
      <div className="text-center">
        <div className="text-slate-500 text-lg">This is a</div>
        <div className="text-4xl font-black text-slate-800">{item.name}!</div>
      </div>
      <div className="flex gap-2 mt-2">
        {level.items.map((_, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i <= currentIdx ? 'bg-primary' : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  )
}

// ── GAME PHASE ─────────────────────────────────────────────────────────────────

function GamePhase({ level, onDone }) {
  const navigate = useNavigate()
  const [holes, setHoles] = useState(Array(9).fill(null))
  const [target, setTarget] = useState(() => level.items[Math.floor(Math.random() * level.items.length)])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [hitEffect, setHitEffect] = useState(null) // { idx, type: 'correct' | 'wrong' }

  const holesRef = useRef(Array(9).fill(null))
  const targetRef = useRef(level.items[Math.floor(Math.random() * level.items.length)])
  const scoreRef = useRef(0)
  const moleTimersRef = useRef({})
  const isDoneRef = useRef(false)
  const popIntervalRef = useRef(null)
  const hitEffectTimerRef = useRef(null)
  const { setScore: setSessionScore } = useGameSession('whackamole')

  useEffect(() => { setSessionScore(score) }, [score]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync target ref
  useEffect(() => { targetRef.current = target }, [target])

  const removeMole = useCallback((idx) => {
    if (moleTimersRef.current[idx]) {
      clearTimeout(moleTimersRef.current[idx])
      delete moleTimersRef.current[idx]
    }
    holesRef.current = holesRef.current.map((h, i) => i === idx ? null : h)
    setHoles([...holesRef.current])
  }, [])

  const addMole = useCallback(() => {
    const empty = holesRef.current.map((h, i) => h === null ? i : -1).filter(i => i !== -1)
    if (empty.length === 0) return

    const idx = empty[Math.floor(Math.random() * empty.length)]
    const item = level.items[Math.floor(Math.random() * level.items.length)]

    holesRef.current = holesRef.current.map((h, i) => i === idx ? item : h)
    setHoles([...holesRef.current])

    moleTimersRef.current[idx] = setTimeout(() => {
      delete moleTimersRef.current[idx]
      holesRef.current = holesRef.current.map((h, i) => i === idx ? null : h)
      setHoles([...holesRef.current])
    }, MOLE_VISIBLE_MS)
  }, [level.items])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // End game when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && !isDoneRef.current) {
      isDoneRef.current = true
      clearInterval(popIntervalRef.current)
      Object.values(moleTimersRef.current).forEach(clearTimeout)
      onDone(scoreRef.current)
    }
  }, [timeLeft, onDone])

  // Pop moles at intervals
  useEffect(() => {
    addMole()
    popIntervalRef.current = setInterval(addMole, POP_INTERVAL_MS)
    return () => {
      clearInterval(popIntervalRef.current)
      Object.values(moleTimersRef.current).forEach(clearTimeout)
    }
  }, [addMole])

  const handleHit = useCallback((idx) => {
    if (isDoneRef.current) return
    const item = holesRef.current[idx]
    if (!item) return

    removeMole(idx)

    clearTimeout(hitEffectTimerRef.current)
    if (item.name === targetRef.current?.name) {
      scoreRef.current += 1
      setScore(s => s + 1)
      setHitEffect({ idx, type: 'correct' })

      const others = level.items.filter(i => i.name !== targetRef.current.name)
      const newTarget = others[Math.floor(Math.random() * others.length)]
      targetRef.current = newTarget
      setTarget(newTarget)
    } else {
      setHitEffect({ idx, type: 'wrong' })
    }

    hitEffectTimerRef.current = setTimeout(() => setHitEffect(null), 350)
  }, [level.items, removeMole])

  useEffect(() => () => clearTimeout(hitEffectTimerRef.current), [])

  const timerColor = timeLeft > 15 ? 'text-green-600' : timeLeft > 5 ? 'text-yellow-600' : 'text-red-600 animate-pulse'

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-2">
        <div className="bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm font-bold text-slate-700">
          ⭐ {score}
        </div>
        <div className={`font-black text-2xl ${timerColor}`}>
          ⏱ {timeLeft}s
        </div>
        <button onClick={() => navigate('/')} className="w-10 h-10 bg-white/70 rounded-full flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-slate-500">home</span>
        </button>
      </div>

      {/* Target */}
      <div className="px-6 py-3 text-center">
        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Hit the</p>
        <div className="inline-flex items-center gap-2 bg-white rounded-2xl shadow-md px-6 py-3">
          <span className="text-3xl">{target.emoji}</span>
          <span className="text-3xl font-black text-slate-800">{target.name}</span>
        </div>
      </div>

      {/* Mole grid */}
      <div className="flex-1 px-5 pb-6 flex items-center">
        <div className="grid grid-cols-3 gap-3 w-full">
          {holes.map((item, idx) => {
            const effect = hitEffect?.idx === idx ? hitEffect.type : null
            return (
              <button
                key={idx}
                onClick={() => item && handleHit(idx)}
                className={`
                  aspect-square rounded-2xl flex items-center justify-center
                  transition-all duration-150
                  ${effect === 'correct' ? 'bg-primary/40 border-4 border-primary scale-110' :
                    effect === 'wrong' ? 'bg-red-200 border-4 border-red-400 scale-90' :
                    item ? 'bg-amber-100 border-4 border-amber-300 cursor-pointer hover:scale-105 active:scale-95 shadow-md' :
                    'bg-amber-900/15 border-4 border-amber-900/10 cursor-default'}
                `}
              >
                {item && (
                  <span className="text-5xl select-none">{item.emoji}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── RESULT PHASE ───────────────────────────────────────────────────────────────

function ResultPhase({ level, score, onRetry, onNext, hasNext }) {
  const navigate = useNavigate()
  const passed = score >= SCORE_TO_UNLOCK
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 gap-6">
      <div className="text-7xl">{passed ? '🏆' : '⭐'}</div>
      <h2 className="text-3xl font-black text-slate-800 text-center">
        {passed ? 'Amazing!' : 'Good try!'}
      </h2>
      <div className="bg-white rounded-2xl shadow-lg px-8 py-5 text-center">
        <div className="text-slate-500 text-sm mb-1">Your score</div>
        <div className="text-6xl font-black text-primary">{score}</div>
        <div className="text-slate-500 text-sm mt-1">
          {passed
            ? `${SCORE_TO_UNLOCK}+ hits to pass ✓`
            : `Need ${SCORE_TO_UNLOCK} hits to unlock next level`}
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onRetry}
          className="w-full bg-white text-slate-700 font-bold text-lg py-4 rounded-xl border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 transition-all shadow-sm"
        >
          🔄 Try Again
        </button>
        {passed && hasNext && (
          <button
            onClick={onNext}
            className="w-full bg-primary text-slate-900 font-black text-lg py-4 rounded-xl border-b-4 border-green-600 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
          >
            Next Level! →
          </button>
        )}
        <button
          onClick={() => navigate('/')}
          className="w-full bg-slate-100 text-slate-500 font-semibold text-base py-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">home</span> Back to Home
        </button>
      </div>
    </div>
  )
}

// ── ROOT ───────────────────────────────────────────────────────────────────────

export default function WhackaMoleGame() {
  const [unlockedLevels, setUnlockedLevels] = useState(() => {
    try {
      const stored = localStorage.getItem('whackamole_unlocked')
      return stored ? JSON.parse(stored) : [1]
    } catch {
      return [1]
    }
  })
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [phase, setPhase] = useState('select') // 'select' | 'learn' | 'play' | 'result'
  const [finalScore, setFinalScore] = useState(0)

  const handleLevelSelect = (level) => {
    setSelectedLevel(level)
    setPhase('learn')
  }

  const handleGameDone = (score) => {
    setFinalScore(score)
    if (score >= SCORE_TO_UNLOCK) {
      const nextId = selectedLevel.id + 1
      if (nextId <= LEVELS.length && !unlockedLevels.includes(nextId)) {
        const newUnlocked = [...unlockedLevels, nextId]
        setUnlockedLevels(newUnlocked)
        localStorage.setItem('whackamole_unlocked', JSON.stringify(newUnlocked))
      }
    }
    setPhase('result')
  }

  const hasNextLevel = selectedLevel &&
    selectedLevel.id < LEVELS.length &&
    unlockedLevels.includes(selectedLevel.id + 1)

  return (
    <div className="bg-gradient-to-b from-amber-100 to-green-50 font-display text-slate-900 antialiased">
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 -left-10 w-32 h-32 bg-white/40 rounded-full blur-xl" />
          <div className="absolute top-40 -right-10 w-48 h-48 bg-amber-300/20 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col flex-1">
          {phase === 'select' && (
            <LevelSelect unlockedLevels={unlockedLevels} onSelect={handleLevelSelect} />
          )}
          {phase === 'learn' && selectedLevel && (
            <LearnPhase
              level={selectedLevel}
              onDone={() => setPhase('play')}
              onBack={() => setPhase('select')}
            />
          )}
          {phase === 'play' && selectedLevel && (
            <GamePhase
              key={`${selectedLevel.id}-${Date.now()}`}
              level={selectedLevel}
              onDone={handleGameDone}
            />
          )}
          {phase === 'result' && selectedLevel && (
            <ResultPhase
              level={selectedLevel}
              score={finalScore}
              onRetry={() => setPhase('learn')}
              onNext={() => {
                const next = LEVELS.find(l => l.id === selectedLevel.id + 1)
                if (next) { setSelectedLevel(next); setPhase('learn') }
              }}
              hasNext={hasNextLevel}
            />
          )}
        </div>
      </div>
    </div>
  )
}
