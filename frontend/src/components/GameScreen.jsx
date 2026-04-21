import { useNavigate } from 'react-router-dom'

export default function GameScreen() {
  const navigate = useNavigate()

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col overflow-hidden selection:bg-primary selection:text-slate-900">

      {/* Top Navigation */}
      <header className="flex items-center justify-between p-6 z-10 relative">
        <button
          aria-label="Close"
          onClick={() => navigate('/')}
          className="group flex items-center justify-center w-12 h-12 rounded-full bg-surface-light dark:bg-surface-dark shadow-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-opacity-80 transition-colors"
        >
          <span className="material-symbols-outlined text-3xl font-bold group-hover:scale-110 transition-transform">close</span>
        </button>

        {/* Progress Indicator */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
        </div>

        <button
          aria-label="Help"
          className="group flex items-center justify-center w-12 h-12 rounded-full bg-surface-light dark:bg-surface-dark shadow-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-opacity-80 transition-colors"
        >
          <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">help</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8 w-full max-w-xl mx-auto relative">

        {/* Background Decorative Blob */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/20 rounded-full blur-3xl -z-10 dark:bg-primary/10"></div>

        {/* Character / Image Container */}
        <div className="w-full aspect-square max-w-[320px] mb-6 relative group cursor-pointer">
          <div className="absolute inset-0 bg-white dark:bg-surface-dark rounded-xl shadow-xl transform transition-transform group-hover:scale-[1.02] duration-300 flex items-center justify-center overflow-hidden">
            <img
              alt="A bright red apple on a simple background"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC6Q5b32NKK7VEhcLbMZZuQAOL4v1cOAeEa7f4Vh_NWjpka3_4yzMyM3YizfYaGQi2kM3aW4weGbyCCF_0S8s-ZO_wIoLIrwvGzLQJ5svKPHFooGXe862CQ2BXnf4uxqnzB_697M5AHUR7Amm1y6kzYiZxgEBtiKRrNWuuemBOUgUSvJb_ynv6IOFFam8UeVoyxY_TDnNmLA2OsI0qaBCkyemzbv3WeTZsWvQr75gnptwyeIMzmbZDWQg0QTOzgrFKJihTFBbjnDI"
            />
          </div>
          {/* Fun Badge */}
          <div className="absolute -top-4 -right-4 bg-yellow-400 text-slate-900 font-bold px-4 py-1 rounded-full shadow-lg transform rotate-6 border-2 border-white dark:border-surface-dark">
            New Word!
          </div>
        </div>

        {/* Prompt Text */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-xl font-medium text-slate-500 dark:text-slate-400">Say the word</h2>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Apple</h1>
        </div>

        {/* Interactive Area */}
        <div className="w-full flex flex-col items-center gap-6 mt-auto">

          {/* Sound Wave Visualizer */}
          <div className="h-12 flex items-center justify-center gap-1.5 w-full max-w-[200px]">
            <div className="sound-wave-bar w-2 bg-primary/60 rounded-full h-2"></div>
            <div className="sound-wave-bar w-2 bg-primary/80 rounded-full h-4"></div>
            <div className="sound-wave-bar w-2 bg-primary rounded-full h-8"></div>
            <div className="sound-wave-bar w-2 bg-primary/80 rounded-full h-4"></div>
            <div className="sound-wave-bar w-2 bg-primary/60 rounded-full h-2"></div>
          </div>

          {/* Big Microphone Button */}
          <button className="relative group cursor-pointer touch-manipulation">
            <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-ping"></div>
            <div className="absolute inset-0 bg-primary rounded-full opacity-40 blur-sm group-hover:opacity-60 transition-opacity"></div>
            <div className="relative flex items-center justify-center w-24 h-24 bg-primary text-slate-900 rounded-full shadow-[0_8px_30px_rgb(25,230,107,0.3)] transform transition-all duration-200 group-hover:scale-105 group-active:scale-95 border-4 border-white dark:border-surface-dark">
              <span className="material-symbols-outlined text-5xl">mic</span>
            </div>
          </button>

          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg animate-pulse">Tap to speak</p>
        </div>
      </main>

      <footer className="h-6 w-full"></footer>
    </div>
  )
}
