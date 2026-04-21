import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import PinModal from './PinModal'

export default function Home() {
  const navigate = useNavigate()
  const { activeChild } = useAuth()

  const [showPinModal, setShowPinModal] = useState(false)
  const [screenTime, setScreenTime] = useState(null) // null = loading
  const [xp, setXp] = useState(null)

  useEffect(() => {
    if (!activeChild) return
    api.getScreenTime(activeChild.id)
      .then(setScreenTime)
      .catch(() => setScreenTime({ exceeded: false }))
    api.getChildXp(activeChild.id)
      .then(setXp)
      .catch(() => setXp(null))
  }, [activeChild])

  function handleLockClick() {
    setShowPinModal(true)
  }

  async function verifyPin(pin) {
    await api.verifyPin(pin)
  }

  function onPinSuccess() {
    setShowPinModal(false)
    navigate('/insights')
  }

  const exceeded = screenTime?.exceeded ?? false
  const screenTimeReady = screenTime && typeof screenTime.used_minutes === 'number'

  return (
    <div className="bg-gradient-to-br from-sky-100 to-green-50 dark:from-slate-900 dark:to-emerald-950 font-display text-slate-900 dark:text-slate-100 antialiased selection:bg-primary selection:text-slate-900 min-h-screen flex flex-col">

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/40 dark:bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-50 sticky top-0 flex items-center justify-between gap-4 px-8 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-white/50 dark:border-slate-800 shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">KidsLearn</span>
        </div>

        <div className="hidden md:block" />

        <div className="flex items-center justify-end gap-3 min-w-0">
          <ScreenTimeMeter screenTime={screenTime} loading={!screenTimeReady} />

          {/* Parental Gate */}
          <button
            onClick={handleLockClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-sm border border-white/50 dark:border-slate-700 text-slate-500 hover:text-primary transition-colors shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>
            <span className="text-sm font-semibold hidden sm:inline">Parent Access</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 px-8 py-8">
        <div className="max-w-7xl mx-auto">

          {/* Screen time warning */}
          {exceeded && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-orange-400 mt-0.5">timer_off</span>
              <div>
                <p className="font-bold text-orange-700 text-sm">Time's up for today!</p>
                <p className="text-orange-600 text-xs mt-0.5">You've reached your screen time limit. Ask a parent to unlock more time.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch mb-8">
            <ChildProfileWidget child={activeChild} xp={xp} />
            <ForestAdventureCard
              exceeded={exceeded}
              xp={xp}
              onClick={() => !exceeded && navigate('/game/forest')}
            />
          </div>

          <section>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-5">Let's Play!</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">

                <GameCard
                  emoji="🎹"
                  label="Music"
                  color="border-accent-purple"
                  bgColor="bg-accent-purple/20"
                  textColor="text-accent-purple"
                  onClick={() => navigate('/game/notes')}
                  disabled={exceeded}
                />

                <GameCard
                  emoji="🔨"
                  label="Whack!"
                  color="border-accent-red"
                  bgColor="bg-accent-red/20"
                  textColor="text-accent-red"
                  onClick={() => navigate('/game/whackamole')}
                  disabled={exceeded}
                />

                <GameCard
                  emoji="🐾"
                  label="Animals"
                  color="border-accent-blue"
                  bgColor="bg-accent-blue/20"
                  textColor="text-accent-blue"
                  onClick={() => navigate('/game/animals')}
                  disabled={exceeded}
                />

                <GameCard
                  icon="calculate"
                  label="Numbers"
                  color="border-accent-yellow"
                  bgColor="bg-accent-yellow/20"
                  textColor="text-accent-yellow"
                  onClick={() => navigate('/game/math')}
                  disabled={exceeded}
                />

            </div>
          </section>
        </div>
      </main>

      <footer className="mt-20 pb-8 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-xl">rocket_launch</span>
            <span className="text-base font-black tracking-tight text-slate-700 dark:text-slate-300">KidsLearn</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Made with care for curious kids &mdash; learn, play, and grow every day.
          </p>
          <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-2">
            &copy; {new Date().getFullYear()} KidsLearn
          </p>
        </div>
      </footer>

      {/* PIN Modal */}
      {showPinModal && (
        <PinModal
          title="Parent Access"
          onVerify={verifyPin}
          onSuccess={onPinSuccess}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  )
}

function ChildProfileWidget({ child, xp }) {
  const balance = xp?.balance ?? 0
  const earnedToday = xp?.earned_today ?? 0
  const spentToday = xp?.spent_today ?? 0

  return (
    <section className="relative h-[280px] lg:h-[300px] overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-white/70 dark:border-slate-700 p-6 flex flex-col justify-between">
      <div className="absolute -right-12 -top-16 w-48 h-48 rounded-full bg-primary/20" />
      <div className="absolute -left-10 -bottom-14 w-44 h-44 rounded-full bg-accent-blue/20" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-primary-dark dark:text-primary">Explorer Profile</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
            Hi, {child?.name ?? 'Friend'}!
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Play learning games to earn XP for forest runs.
          </p>
        </div>
        <div className="w-16 h-16 rounded-full bg-primary/20 border-4 border-white dark:border-slate-700 flex items-center justify-center text-4xl shadow-sm shrink-0">
          {child?.avatar ?? '🐻'}
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2.5">
        <ProfileStat label="XP Balance" value={balance} icon="bolt" strong />
        <ProfileStat label="Earned Today" value={earnedToday} icon="trending_up" />
        <ProfileStat label="Spent Today" value={spentToday} icon="forest" />
      </div>
    </section>
  )
}

function ProfileStat({ label, value, icon, strong = false }) {
  return (
    <div className={`${strong ? 'bg-primary text-slate-900' : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200'} rounded-xl p-3 shadow-sm`}>
      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider opacity-75">
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  )
}

function ForestAdventureCard({ exceeded, xp, onClick }) {
  const cost = xp?.forest_entry_cost ?? 25
  const balance = xp?.balance ?? 0
  const canAfford = balance >= cost
  const disabled = exceeded || !canAfford
  const needed = Math.max(0, cost - balance)

  return (
    <button
      type="button"
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={`block text-left w-full h-[280px] lg:h-[300px] rounded-2xl overflow-hidden shadow-xl relative group transition-transform hover:scale-[1.02] active:scale-[0.98] ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent z-10" />
      <img
        alt="Adventure Map"
        className="w-full h-full object-cover"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPXuXeCuV6S_po5mvDGvDfEN4Hr08Q0OoLk1LfhGV468spIwDamycUVV51s_bvaGlLc9Q6VDlKQjr5pjfwBpP495q-WBOUPwtHx7oljyzRyVEIjmDD8iYzR-F2P1tv6bQXUGseAOd7Pr0Dy_RUDryMv_wk6pI5Hs__EgVDN59tg0Qk7hZsQobqKmHYnPUR3d4KztnpUXhLM8I3fRgI8qYC-IbZjomzgPlpMG72HJfoA9aVmo7fb6ucEPaY6DcwlaiuCxpATVjI1A0"
      />
      <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between gap-3">
        <div className={`${canAfford ? 'bg-primary text-slate-900' : 'bg-white/90 text-slate-800'} text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider`}>
          {canAfford ? `Costs ${cost} XP` : `${balance}/${cost} XP`}
        </div>
        <div className="bg-white/20 backdrop-blur-md w-14 h-14 rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-white text-[36px] fill-1">{disabled ? 'lock' : 'play_arrow'}</span>
        </div>
      </div>
      <div className="absolute bottom-5 left-5 right-5 z-20 text-white">
        <h3 className="text-3xl font-black tracking-tight drop-shadow-md">Forest Explore</h3>
        <p className="mt-2 text-sm font-semibold text-white/85">
          {exceeded
            ? 'Daily screen time limit reached'
            : canAfford
              ? `Spend ${cost} XP to start a run`
              : `Need ${needed} more XP. Play Let's Play games to earn XP.`}
        </p>
        {!exceeded && !canAfford && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 px-3 py-2 text-xs font-bold text-white/90">
            <span className="material-symbols-outlined text-[16px]">sports_esports</span>
            Try Music, Whack!, Animals, or Numbers.
          </div>
        )}
      </div>
    </button>
  )
}

function ScreenTimeMeter({ screenTime, loading }) {
  const limit = screenTime?.limit_minutes ?? 0
  const used = screenTime?.used_minutes ?? 0
  const remaining = screenTime?.remaining_minutes ?? limit
  const progress = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const progressColor = screenTime?.exceeded
    ? 'bg-orange-400'
    : progress >= 80
      ? 'bg-accent-yellow'
      : 'bg-primary'

  return (
    <section className="hidden lg:block w-72 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl px-3 py-2.5 shadow-sm border border-white/70 dark:border-slate-700 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">schedule</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">Today</p>
            <p className={`text-[11px] font-black shrink-0 ${screenTime?.exceeded ? 'text-orange-600' : 'text-slate-600 dark:text-slate-300'}`}>
              {loading ? '--' : `${used}/${limit}m`}
            </p>
          </div>
          <div className="mt-1.5 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} rounded-full transition-all duration-500`}
              style={{ width: `${loading ? 0 : progress}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate">
            {loading ? 'Loading play time' : screenTime?.exceeded ? 'Daily limit reached' : `${Math.max(0, Math.round(remaining))} min left`}
          </p>
        </div>
      </div>
    </section>
  )
}

function GameCard({ emoji, icon, label, color, bgColor, textColor, onClick, disabled }) {
  return (
    <button
      onClick={() => !disabled && onClick()}
      disabled={disabled}
      className={`flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border-b-4 ${color} hover:shadow-md active:border-b-0 active:translate-y-1 transition-all h-44 justify-center group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`w-16 h-16 ${bgColor} ${textColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-4xl`}>
        {emoji ?? <span className="material-symbols-outlined text-[40px]">{icon}</span>}
      </div>
      <span className="font-bold text-lg text-slate-700 dark:text-slate-200">{label}</span>
    </button>
  )
}
