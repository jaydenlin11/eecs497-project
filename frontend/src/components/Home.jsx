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

  useEffect(() => {
    if (!activeChild) return
    api.getScreenTime(activeChild.id)
      .then(setScreenTime)
      .catch(() => setScreenTime({ exceeded: false }))
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

  return (
    <div className="bg-gradient-to-br from-sky-100 to-green-50 dark:from-slate-900 dark:to-emerald-950 font-display text-slate-900 dark:text-slate-100 antialiased selection:bg-primary selection:text-slate-900 min-h-screen flex flex-col">

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/40 dark:bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 sticky top-0 flex items-center justify-between px-8 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-white/50 dark:border-slate-800 shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">KidsLearn</span>
        </div>

        {/* Active child profile */}
        <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/50 dark:border-slate-700">
          <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-white dark:border-slate-600 flex items-center justify-center text-xl shrink-0">
            {activeChild?.avatar ?? '🐻'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
              Hi, {activeChild?.name ?? 'Friend'}!
            </span>
            <div className="flex gap-0.5">
              <span className="material-symbols-outlined text-accent-yellow text-[14px] fill-1">star</span>
              <span className="material-symbols-outlined text-accent-yellow text-[14px] fill-1">star</span>
              <span className="material-symbols-outlined text-accent-yellow text-[14px] fill-1">star</span>
            </div>
          </div>
        </div>

        {/* Parental Gate */}
        <button
          onClick={handleLockClick}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-sm border border-white/50 dark:border-slate-700 text-slate-500 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>
          <span className="text-sm font-semibold hidden sm:inline">Parent Access</span>
        </button>
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

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 items-start">

            {/* Left Column: Hero / Featured Activity */}
            <div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">
                Ready to explore?
              </h2>
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl relative group cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                <img
                  alt="Adventure Map"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPXuXeCuV6S_po5mvDGvDfEN4Hr08Q0OoLk1LfhGV468spIwDamycUVV51s_bvaGlLc9Q6VDlKQjr5pjfwBpP495q-WBOUPwtHx7oljyzRyVEIjmDD8iYzR-F2P1tv6bQXUGseAOd7Pr0Dy_RUDryMv_wk6pI5Hs__EgVDN59tg0Qk7hZsQobqKmHYnPUR3d4KztnpUXhLM8I3fRgI8qYC-IbZjomzgPlpMG72HJfoA9aVmo7fb6ucEPaY6DcwlaiuCxpATVjI1A0"
                />
                <div className="absolute bottom-5 left-5 z-20 text-white">
                  <div className="bg-primary text-slate-900 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2 uppercase tracking-wider">
                    New Adventure
                  </div>
                  <h3 className="text-3xl font-black tracking-tight drop-shadow-md">Forest Explore</h3>
                </div>
                <div className="absolute top-5 right-5 z-20 bg-white/20 backdrop-blur-md w-14 h-14 rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-[36px] fill-1">play_arrow</span>
                </div>
              </div>
            </div>

            {/* Right Column: Learning Categories Grid */}
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-5">Let's Play!</h3>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">

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

              {/* Puzzles Card (full width) */}
              <button
                onClick={() => !exceeded && navigate('/game')}
                disabled={exceeded}
                className={`w-full flex items-center gap-6 bg-white dark:bg-slate-800 px-6 py-5 rounded-xl shadow-sm border-b-4 border-primary hover:shadow-md active:border-b-0 active:translate-y-1 transition-all group ${exceeded ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="w-16 h-16 bg-primary/20 text-green-600 dark:text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <span className="material-symbols-outlined text-[40px]">extension</span>
                </div>
                <div className="text-left flex-1">
                  <span className="font-bold text-xl text-slate-700 dark:text-slate-200 block">Puzzles</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Daily Challenge</span>
                </div>
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
                </div>
              </button>
            </div>

          </div>
        </div>
      </main>

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
