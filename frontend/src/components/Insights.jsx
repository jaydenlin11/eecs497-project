import { useNavigate } from 'react-router-dom'

export default function Insights() {
  const navigate = useNavigate()

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col antialiased">

      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Parent Dashboard</h1>
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      <main className="flex-1 px-4 py-6 flex flex-col gap-6 overflow-y-auto pb-24">

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
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                45 <span className="text-sm font-normal text-slate-500">mins</span>
              </span>
            </div>
            <div className="relative h-6 flex items-center">
              <input
                className="range-slider w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                type="range"
                min="0"
                max="120"
                defaultValue="45"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>15m</span>
              <span>30m</span>
              <span>45m</span>
              <span>1h</span>
              <span>2h</span>
            </div>
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">info</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                App locks automatically after limit is reached. Can be unlocked with your PIN.
              </p>
            </div>
          </div>
        </section>

        {/* Learning Progress */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500">
                <span className="material-symbols-outlined">insights</span>
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">Learning Progress</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Weekly skill growth</p>
              </div>
            </div>
            <button className="text-xs font-bold text-primary hover:text-green-600 transition-colors">View Report</button>
          </div>

          <div className="space-y-5">
            {/* Literacy */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">menu_book</span> Literacy
                </span>
                <span className="font-bold text-slate-900 dark:text-white">82%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full w-[82%]"></div>
              </div>
            </div>

            {/* Logic & Math */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">calculate</span> Logic &amp; Math
                </span>
                <span className="font-bold text-slate-900 dark:text-white">65%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[65%]"></div>
              </div>
            </div>

            {/* Motor Skills */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">touch_app</span> Motor Skills
                </span>
                <span className="font-bold text-slate-900 dark:text-white">48%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full w-[48%]"></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
              <p className="text-xs text-slate-500">Activities Done</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">3.5h</p>
              <p className="text-xs text-slate-500">Total Focus Time</p>
            </div>
          </div>
        </section>

        {/* Privacy & Safety */}
        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Privacy &amp; Safety</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage data permissions</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex-1 pr-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Safe Audio Collection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                Allow app to process voice for pronunciation activities. Data is processed locally and never uploaded.
              </p>
              <span className="inline-block mt-2 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                COPPA Compliant
              </span>
            </div>
            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input defaultChecked className="sr-only peer" type="checkbox" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button className="w-full py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">shield_person</span>
              Change Parent PIN
            </button>
          </div>
        </section>

        {/* Child Profile */}
        <section className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <img
              className="w-16 h-16 rounded-full border-4 border-white/20 object-cover shadow-md"
              alt="Smiling toddler girl playing with blocks"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsFzlist16FuOy3a0-_HjwmvWk83kpxA-kqQDoVVoFYuPk5sbOFwn8HsKRgythMCMzIv0EwdJ1iUJ_A5AbfQ8N5-f73WSgPHHzHo76tkDP-KaxWyVp43grNJO7-RwxqPHGqpol769jnYZzqjTZokuoaCJUlMVd2LLRFLK0kpmS9cphMJn6cG7csP0XQEtd3U-9H0Vj5yXfowU0ajRixJhz8nHQS8-v5KG_2pUyF5LYGYpzwcsOoqXxpuzYT6q9u_vw8WPJyeW0bss"
            />
            <div>
              <h3 className="font-bold text-lg">Emma's Profile</h3>
              <p className="text-blue-100 text-sm">Age: 4 years • Pre-K Level</p>
            </div>
            <button className="ml-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-6 -top-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </section>

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-2 flex justify-between items-center z-50">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 group">
          <div className="p-1.5 rounded-xl group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>home</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 group-hover:text-primary">Home</span>
        </button>
        <button onClick={() => navigate('/game')} className="flex flex-col items-center gap-1 group">
          <div className="p-1.5 rounded-xl group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>sports_esports</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 group-hover:text-primary">Games</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-1.5 rounded-xl group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>school</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 group-hover:text-primary">Learn</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-1.5 rounded-xl bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>supervisor_account</span>
          </div>
          <span className="text-[10px] font-bold text-primary">Parents</span>
        </button>
      </nav>

    </div>
  )
}
