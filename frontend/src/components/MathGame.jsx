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
    <div className="bg-gradient-to-b from-yellow-50 to-orange-50 font-display text-slate-900 antialiased">
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl">

        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-10 -left-10 w-40 h-40 bg-accent-yellow/30 rounded-full blur-2xl" />
          <div className="absolute bottom-20 -right-10 w-48 h-48 bg-orange-200/50 rounded-full blur-2xl" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-white/70 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black text-slate-800">Math Challenge</h1>
            <p className="text-xs text-slate-500">Addition & Subtraction</p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <span className="font-bold text-slate-700 text-sm">⭐ {score}/{total}</span>
          </div>
        </div>

        {/* Streak banner */}
        {streak >= 3 && (
          <div className="relative z-10 mx-6 mb-2 bg-primary/20 text-green-700 rounded-xl py-2 text-center font-bold text-sm">
            🔥 {streak} in a row! Keep it up!
          </div>
        )}

        {/* Main content */}
        <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-6 gap-8">

          {/* Problem display */}
          <div
            className={`
              w-full bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center gap-4 transition-all duration-200
              ${bgCorrect ? 'ring-4 ring-primary bg-primary/10' : ''}
              ${bgWrong && shake ? 'ring-4 ring-red-400' : ''}
              ${shake ? 'animate-[shake_0.4s_ease]' : ''}
            `}
          >
            {/* Numbers */}
            <div className="flex items-center gap-4">
              <span className="text-7xl font-black text-slate-800 tabular-nums">{problem.a}</span>
              <span className="text-5xl font-black text-accent-yellow">{problem.op}</span>
              <span className="text-7xl font-black text-slate-800 tabular-nums">{problem.b}</span>
              <span className="text-5xl font-black text-slate-400">=</span>
              <span className="text-7xl font-black text-slate-300 tabular-nums">?</span>
            </div>

            {/* Hint dots (visual counting aid) */}
            {problem.a <= 10 && problem.b <= 10 && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
                  {Array.from({ length: problem.a }).map((_, i) => (
                    <div key={`a-${i}`} className="w-5 h-5 rounded-full bg-accent-blue" />
                  ))}
                </div>
                {problem.op === '+' && (
                  <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
                    {Array.from({ length: problem.b }).map((_, i) => (
                      <div key={`b-${i}`} className="w-5 h-5 rounded-full bg-accent-yellow" />
                    ))}
                  </div>
                )}
                {problem.op === '−' && (
                  <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
                    {Array.from({ length: problem.b }).map((_, i) => (
                      <div key={`b-${i}`} className="w-5 h-5 rounded-full bg-red-300" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feedback message */}
          <div className="h-10 flex items-center">
            {feedback === 'correct' && (
              <p className="text-xl font-bold text-green-600">{message}</p>
            )}
            {feedback === 'wrong' && (
              <p className="text-xl font-bold text-red-500">{message}</p>
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
              disabled={!!feedback}
              placeholder="?"
              className="w-40 h-20 text-center text-5xl font-black rounded-2xl border-4 border-slate-200 bg-white shadow-md focus:outline-none focus:border-primary transition-colors disabled:opacity-50 tabular-nums"
            />
            <button
              type="submit"
              disabled={!input || !!feedback}
              className="w-full max-w-xs bg-primary text-slate-900 font-black text-xl py-4 rounded-2xl shadow-lg border-b-4 border-green-500 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-40"
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

        {/* Bottom padding */}
        <div className="h-12" />

      </div>

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
