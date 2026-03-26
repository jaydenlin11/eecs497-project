import { useState, useEffect } from 'react'

/**
 * 4-digit PIN entry modal.
 *
 * Props:
 *   title     - heading text
 *   onSuccess - called with the entered PIN string on correct entry
 *   onVerify  - async fn(pin) => void  — should throw on failure
 *   onClose   - called when user dismisses
 *   maxAttempts - default 3
 */
export default function PinModal({ title = 'Enter PIN', onVerify, onSuccess, onClose, maxAttempts = 3 }) {
  const [digits, setDigits] = useState([])
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lockCountdown, setLockCountdown] = useState(0)

  // Countdown timer when locked out
  useEffect(() => {
    if (!locked) return
    let secs = 30
    setLockCountdown(secs)
    const interval = setInterval(() => {
      secs -= 1
      setLockCountdown(secs)
      if (secs <= 0) {
        clearInterval(interval)
        setLocked(false)
        setAttempts(0)
        setDigits([])
        setError('')
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [locked])

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (digits.length !== 4) return
    ;(async () => {
      const pin = digits.join('')
      try {
        await onVerify(pin)
        onSuccess(pin)
      } catch (err) {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= maxAttempts) {
          setLocked(true)
          setError('')
        } else {
          setError(err.message || 'Incorrect PIN')
        }
        setDigits([])
      }
    })()
  }, [digits]) // eslint-disable-line react-hooks/exhaustive-deps

  function press(n) {
    if (locked || digits.length >= 4) return
    setError('')
    setDigits((d) => [...d, n])
  }

  function backspace() {
    setError('')
    setDigits((d) => d.slice(0, -1))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 font-display">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {locked ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-slate-700 font-semibold">Too many attempts</p>
            <p className="text-slate-500 text-sm mt-1">Try again in <span className="font-bold text-primary">{lockCountdown}s</span></p>
          </div>
        ) : (
          <>
            {/* Dot display */}
            <div className="flex justify-center gap-4 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                    i < digits.length
                      ? 'bg-primary border-primary scale-110'
                      : 'bg-transparent border-slate-300'
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-3 animate-pulse">{error}</p>
            )}
            {attempts > 0 && !error && (
              <p className="text-slate-400 text-xs text-center mb-3">
                {maxAttempts - attempts} attempt{maxAttempts - attempts !== 1 ? 's' : ''} remaining
              </p>
            )}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  onClick={() => press(String(n))}
                  className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-xl font-bold text-slate-800 transition-all border border-slate-100"
                >
                  {n}
                </button>
              ))}
              <div /> {/* empty */}
              <button
                onClick={() => press('0')}
                className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-xl font-bold text-slate-800 transition-all border border-slate-100"
              >
                0
              </button>
              <button
                onClick={backspace}
                className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-500 transition-all border border-slate-100 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">backspace</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
