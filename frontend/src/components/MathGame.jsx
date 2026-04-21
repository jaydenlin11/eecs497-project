import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../hooks/useGameSession'

function generateProblem() {
  const isAdd = Math.random() > 0.45
  let a, b, answer, op
  if (isAdd) {
    a = Math.floor(Math.random() * 10) + 1   // 1–10
    b = Math.floor(Math.random() * 10) + 1   // 1–10
    op = '+'
    answer = a + b
  } else {
    a = Math.floor(Math.random() * 9) + 2    // 2–10
    b = Math.floor(Math.random() * (a - 1)) + 1  // 1 to a–1
    op = '−'
    answer = a - b
  }
  return { a, b, op, answer }
}

const ENCOURAGEMENTS = ['Great job! 🎉', "You're amazing! ⭐", 'Correct! 🌟', 'Awesome! 🏆', 'Perfect! 🎊']
const TRY_AGAIN = ['Almost! Try again 🔄', 'Not quite! 💪', 'Keep trying! 🤔', 'So close! 🎯']

export default function MathGame() {
  const navigate = useNavigate()
  const [problem, setProblem] = useState(generateProblem)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [message, setMessage] = useState('')
  const [shake, setShake] = useState(false)
  const inputRef = useRef(null)
  const timeoutRef = useRef(null)
  const { setScore: setSessionScore } = useGameSession('math')

  useEffect(() => { setSessionScore(score) }, [score]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus the input
  useEffect(() => {
    inputRef.current?.focus()
  }, [problem, feedback])

  const nextProblem = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setProblem(generateProblem())
    setInput('')
    setFeedback(null)
  }, [])

  const handleSubmit = useCallback((e) => {
    e?.preventDefault()
    const val = parseInt(input, 10)
    if (isNaN(val)) return

    setTotal(t => t + 1)
    if (val === problem.answer) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(s => s + 1)
      setFeedback('correct')
      setMessage(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)])
      timeoutRef.current = setTimeout(nextProblem, 1500)
    } else {
      setStreak(0)
      setFeedback('wrong')
      setShake(true)
      setMessage(TRY_AGAIN[Math.floor(Math.random() * TRY_AGAIN.length)])
      setTimeout(() => setShake(false), 500)
      timeoutRef.current = setTimeout(() => {
        setFeedback(null)
        setInput('')
      }, 1500)
    }
  }, [input, problem, streak, nextProblem])

  // Keyboard: allow digits, backspace, enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const bgCorrect = feedback === 'correct'
  const bgWrong = feedback === 'wrong'

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 min-h-screen flex flex-col font-display text-slate-900 antialiased">

      {/* Decorative background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-accent-yellow/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-200/50 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Home</span>
        </button>
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-800">Math Challenge</h1>
          <p className="text-xs text-slate-500">Addition &amp; Subtraction</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <span className="font-bold text-slate-700">⭐ {score} / {total}</span>
        </div>
      </header>

      {/* Streak banner */}
      {streak >= 3 && (
        <div className="relative z-10 mx-auto mt-4 bg-primary/20 text-green-700 rounded-xl py-2 px-6 text-center font-bold text-sm">
          🔥 {streak} in a row! Keep it up!
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="min-h-full w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-8">

          {/* Problem display */}
          <div
            className={`
              w-full bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center gap-6 transition-all duration-200
              ${bgCorrect ? 'ring-4 ring-primary bg-primary/10' : ''}
              ${bgWrong && shake ? 'ring-4 ring-red-400' : ''}
              ${shake ? 'animate-[shake_0.4s_ease]' : ''}
            `}
          >
            {/* Numbers */}
            <div className="flex items-center gap-6">
              <span className="text-8xl font-black text-slate-800 tabular-nums">{problem.a}</span>
              <span className="text-6xl font-black text-accent-yellow">{problem.op}</span>
              <span className="text-8xl font-black text-slate-800 tabular-nums">{problem.b}</span>
              <span className="text-6xl font-black text-slate-400">=</span>
              <span className="text-8xl font-black text-slate-300 tabular-nums">?</span>
            </div>

            {/* Hint dots (visual counting aid) */}
            {problem.a <= 10 && problem.b <= 10 && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
                  {Array.from({ length: problem.a }).map((_, i) => (
                    <div key={`a-${i}`} className="w-6 h-6 rounded-full bg-accent-blue" />
                  ))}
                </div>
                {problem.op === '+' && (
                  <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
                    {Array.from({ length: problem.b }).map((_, i) => (
                      <div key={`b-${i}`} className="w-6 h-6 rounded-full bg-accent-yellow" />
                    ))}
                  </div>
                )}
                {problem.op === '−' && (
                  <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
                    {Array.from({ length: problem.b }).map((_, i) => (
                      <div key={`b-${i}`} className="w-6 h-6 rounded-full bg-red-300" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feedback message */}
          <div className="h-10 flex items-center">
            {feedback === 'correct' && (
              <p className="text-2xl font-bold text-green-600">{message}</p>
            )}
            {feedback === 'wrong' && (
              <p className="text-2xl font-bold text-red-500">{message}</p>
            )}
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
            <label className="text-slate-500 font-medium text-sm uppercase tracking-wider">
              Type your answer
            </label>
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onWheel={e => e.target.blur()}
              disabled={!!feedback}
              placeholder="?"
              className="w-48 h-24 text-center text-6xl font-black rounded-2xl border-4 border-slate-200 bg-white shadow-md focus:outline-none focus:border-primary transition-colors disabled:opacity-50 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="submit"
              disabled={!input || !!feedback}
              className="w-full max-w-sm bg-primary text-slate-900 font-black text-xl py-4 rounded-2xl shadow-lg border-b-4 border-green-500 hover:shadow-xl active:border-b-0 active:translate-y-1 transition-all disabled:opacity-40"
            >
              Check! ✓
            </button>
          </form>

          {/* Skip */}
          <button
            onClick={nextProblem}
            className="text-slate-400 hover:text-slate-600 text-sm underline underline-offset-2 transition-colors"
          >
            Skip this problem →
          </button>

        </div>
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
