import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import PinModal from './PinModal'

const GAME_META = {
  math:       { label: 'Logic & Math',  icon: 'calculate',  color: 'bg-primary',     scoreMax: 50  },
  notes:      { label: 'Music',         icon: 'music_note', color: 'bg-accent-purple', scoreMax: 30 },
  animals:    { label: 'Animals',       icon: 'pets',       color: 'bg-accent-blue',   scoreMax: 30 },
  whackamole: { label: 'Whack-a-Mole (Motor Skills)', icon: 'touch_app', color: 'bg-accent-red', scoreMax: 25 },
  forest:     { label: 'Forest Explore', icon: 'forest',     color: 'bg-emerald-500',   scoreMax: 1200 },
}

function pct(totalScore, max) {
  return Math.min(100, Math.round((totalScore / max) * 100))
}

function fmtDuration(seconds) {
  const minutes = seconds / 60
  return `${Number(minutes.toFixed(1))}m`
}

export default function Insights() {
  const navigate = useNavigate()
  const { parent, childProfiles, refreshChildren, logout } = useAuth()

  const [selectedChildId, setSelectedChildId] = useState(childProfiles[0]?.id ?? null)
  const [insights, setInsights] = useState(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [screenTimeLimit, setScreenTimeLimit] = useState(childProfiles[0]?.screen_time_limit ?? 60)
  const [screenTimeMode, setScreenTimeMode] = useState((childProfiles[0]?.screen_time_limit ?? 60) > 120 ? 'other' : 'slider')
  const [savingLimit, setSavingLimit] = useState(false)
  // PIN change flow
  const [showChangePinModal, setShowChangePinModal] = useState(false)
  const [showNewPinModal, setShowNewPinModal] = useState(false)
  const [pinSuccessMsg, setPinSuccessMsg] = useState('')

  // When selected child changes, sync the screen time slider to that child's limit
  useEffect(() => {
    const child = childProfiles.find((c) => c.id === selectedChildId)
    if (child?.screen_time_limit != null) {
      setScreenTimeLimit(child.screen_time_limit)
      setScreenTimeMode(child.screen_time_limit > 120 ? 'other' : 'slider')
    }
  }, [selectedChildId, childProfiles])

  // Load insights when selected child changes
  useEffect(() => {
    if (!selectedChildId) return
    setLoadingInsights(true)
    api.getInsights(selectedChildId)
      .then(setInsights)
      .catch(() => setInsights(null))
      .finally(() => setLoadingInsights(false))
  }, [selectedChildId])

  async function saveScreenTimeLimit(val) {
    const nextVal = Math.max(0, Math.round(Number(val) || 0))
    setSavingLimit(true)
    try {
      await api.updateChild(selectedChildId, { screen_time_limit: nextVal })
      setScreenTimeLimit(nextVal)
      setScreenTimeMode(nextVal > 120 ? 'other' : 'slider')
      await refreshChildren()
    } finally {
      setSavingLimit(false)
    }
  }

  function updateScreenTimeLimitInput(rawValue) {
    const digits = rawValue.replace(/\D/g, '')
    const nextVal = Math.max(0, Number(digits) || 0)
    setScreenTimeLimit(nextVal)
    setScreenTimeMode(nextVal > 120 ? 'other' : 'slider')
  }

  function chooseScreenTimeSliderMode() {
    const nextVal = Math.min(120, screenTimeLimit)
    setScreenTimeMode('slider')
    setScreenTimeLimit(nextVal)
    saveScreenTimeLimit(nextVal)
  }

  function chooseScreenTimeOtherMode() {
    setScreenTimeMode('other')
  }

  // Change PIN flow: first verify current PIN, then set new one
  async function verifyCurrentPin(pin) {
    await api.verifyPin(pin) // throws on failure
  }

  function onCurrentPinSuccess() {
    setShowChangePinModal(false)
    setShowNewPinModal(true)
  }

  async function verifyNewPin(pin) {
    // "Verify" by setting it — if it fails, it throws
    await api.setPin(pin)
  }

  function onNewPinSuccess(pin) {
    setShowNewPinModal(false)
    setPinSuccessMsg('PIN updated successfully!')
    setTimeout(() => setPinSuccessMsg(''), 3000)
  }

  const selectedChild = childProfiles.find((c) => c.id === selectedChildId)

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col antialiased">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-xl">🌳</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">KidsLearn</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">home</span>
              Home
            </button>
            <button
              onClick={() => navigate('/select')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">switch_account</span>
              Switch Child
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>supervisor_account</span>
              Parents
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {parent && <span className="text-sm text-slate-500 hidden sm:inline">Hi, {parent.name}!</span>}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Child selector */}
        {childProfiles.length > 1 && (
          <section className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {childProfiles.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold shrink-0 transition-all ${
                  child.id === selectedChildId
                    ? 'bg-primary border-primary text-slate-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-primary/50'
                }`}
              >
                <span>{child.avatar}</span>
                {child.name}
              </button>
            ))}
          </section>
        )}

        {/* Child profile card */}
        {selectedChild && (
          <section className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl border-4 border-white/20 shadow-md">
                {selectedChild.avatar}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedChild.name}'s Profile</h3>
                <p className="text-blue-100 text-sm">Age: {selectedChild.age} year{selectedChild.age !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-6 -top-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </section>
        )}

        {/* Two-column grid for content cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Learning Progress */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500">
              <span className="material-symbols-outlined">insights</span>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Learning Progress</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Based on all sessions</p>
            </div>
          </div>

          {loadingInsights ? (
            <p className="text-slate-400 text-sm text-center py-4">Loading…</p>
          ) : insights ? (
            <>
              <div className="space-y-5">
                {Object.entries(GAME_META).map(([game, meta]) => {
                  const stats = insights.game_stats[game]
                  const bestScore = Math.max(stats?.best_score ?? 0, insights.high_scores?.[game] ?? 0)
                  const totalScore = stats?.total_score ?? 0
                  const progress = pct(totalScore, meta.scoreMax)
                  return (
                    <div key={game} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">{meta.icon}</span>
                          {meta.label}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {stats ? `${stats.sessions} session${stats.sessions !== 1 ? 's' : ''}` : bestScore > 0 ? 'High score set' : 'No data'}
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${meta.color} rounded-full transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {(stats || bestScore > 0) && (
                        <p className="text-xs text-slate-400">Best score: {bestScore} · Total: {totalScore} pts</p>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{insights.total_sessions}</p>
                  <p className="text-xs text-slate-500">Activities Done</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {fmtDuration(insights.total_duration_seconds)}
                  </p>
                  <p className="text-xs text-slate-500">Total Play Time</p>
                </div>
              </div>

              {/* Recent sessions */}
              {insights.recent_sessions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    {insights.recent_sessions.slice(0, 5).map((s) => {
                      const meta = GAME_META[s.game] ?? { label: s.game, icon: 'sports_esports', color: 'bg-slate-400' }
                      return (
                        <div key={s.id} className="flex items-center gap-3 text-sm">
                          <span className="material-symbols-outlined text-slate-400 text-base">{meta.icon}</span>
                          <span className="text-slate-700 flex-1">{meta.label}</span>
                          <span className="font-semibold text-slate-800">⭐ {s.score}</span>
                          <span className="text-slate-400">{fmtDuration(s.duration_seconds)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">No data yet. Start playing!</p>
          )}
        </section>

        {/* Right column: Screen Time + Privacy stacked */}
        <div className="flex flex-col gap-6">

        {/* Screen Time Control */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
              <span className="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Screen Time Limit</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily usage allowance</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Set Limit</span>
              <label className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={screenTimeLimit}
                  onChange={(e) => updateScreenTimeLimitInput(e.target.value)}
                  onBlur={(e) => {
                    const digits = e.target.value.replace(/\D/g, '')
                    saveScreenTimeLimit(Math.max(0, Number(digits) || 0))
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur()
                    }
                  }}
                  className="w-28 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-right text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Screen time limit in minutes"
                />
                <span className="text-sm font-normal text-slate-500">mins</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={chooseScreenTimeSliderMode}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  screenTimeMode === 'slider'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                0-120m
              </button>
              <button
                type="button"
                onClick={chooseScreenTimeOtherMode}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  screenTimeMode === 'other'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Other
              </button>
            </div>
            {screenTimeMode !== 'other' && (
              <>
                <input
                  className="range-slider w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none accent-primary focus:outline-none cursor-pointer"
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={Math.min(120, screenTimeLimit)}
                  onChange={(e) => {
                    setScreenTimeMode('slider')
                    setScreenTimeLimit(Number(e.target.value))
                  }}
                  onMouseUp={(e) => saveScreenTimeLimit(Number(e.target.value))}
                  onTouchEnd={(e) => saveScreenTimeLimit(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>0m</span>
                  <span>15m</span>
                  <span>1h</span>
                  <span>2h</span>
                </div>
              </>
            )}
            {savingLimit && <p className="text-xs text-slate-400 text-center">Saving…</p>}
            {insights && (
              <div className="p-3 bg-blue-50 dark:bg-slate-800/50 rounded-lg text-xs text-blue-700 dark:text-slate-300">
                Today: {fmtDuration(insights.today_duration_seconds)} used of {screenTimeLimit}m limit
              </div>
            )}
          </div>
        </section>

        {/* Settings */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold leading-tight mb-4">Settings</h2>
          <button
            onClick={() => setShowChangePinModal(true)}
            className="w-full py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">shield_person</span>
            Change Parent PIN
          </button>
          {pinSuccessMsg && (
            <p className="text-green-600 text-sm text-center bg-green-50 py-2 px-3 rounded-lg mt-3">{pinSuccessMsg}</p>
          )}
        </section>

        </div>{/* end right column */}
        </div>{/* end 2-col grid */}

        </div>{/* end max-w-6xl */}
      </main>

      {/* Change PIN: step 1 — verify current PIN */}
      {showChangePinModal && (
        <PinModal
          title="Enter Current PIN"
          onVerify={verifyCurrentPin}
          onSuccess={onCurrentPinSuccess}
          onClose={() => setShowChangePinModal(false)}
        />
      )}

      {/* Change PIN: step 2 — enter new PIN */}
      {showNewPinModal && (
        <NewPinModal
          onSuccess={onNewPinSuccess}
          onClose={() => setShowNewPinModal(false)}
        />
      )}
    </div>
  )
}

/**
 * A variant of PinModal that sets a NEW pin (no verify call — just confirms twice).
 */
function NewPinModal({ onSuccess, onClose }) {
  const [step, setStep] = useState('enter') // 'enter' | 'confirm'
  const [firstPin, setFirstPin] = useState('')
  const [digits, setDigits] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function press(n) {
    if (digits.length >= 4) return
    setError('')
    const next = [...digits, n]
    setDigits(next)
    if (next.length === 4) {
      if (step === 'enter') {
        setFirstPin(next.join(''))
        setStep('confirm')
        setDigits([])
      } else {
        // confirm step
        if (next.join('') !== firstPin) {
          setError("PINs don't match. Try again.")
          setStep('enter')
          setFirstPin('')
          setDigits([])
        } else {
          setLoading(true)
          api.setPin(next.join('')).then(() => {
            onSuccess(next.join(''))
          }).catch((err) => {
            setError(err.message)
            setStep('enter')
            setFirstPin('')
            setDigits([])
          }).finally(() => setLoading(false))
        }
      }
    }
  }

  function backspace() {
    setError('')
    setDigits((d) => d.slice(0, -1))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 font-display">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">
            {step === 'enter' ? 'Enter New PIN' : 'Confirm New PIN'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex justify-center gap-4 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${i < digits.length ? 'bg-primary border-primary scale-110' : 'bg-transparent border-slate-300'}`} />
          ))}
        </div>
        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
        {loading && <p className="text-slate-400 text-sm text-center mb-3">Saving…</p>}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => press(String(n))} className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-xl font-bold text-slate-800 transition-all border border-slate-100">{n}</button>
          ))}
          <div />
          <button onClick={() => press('0')} className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-xl font-bold text-slate-800 transition-all border border-slate-100">0</button>
          <button onClick={backspace} className="h-14 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-500 transition-all border border-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined">backspace</span>
          </button>
        </div>
      </div>
    </div>
  )
}
