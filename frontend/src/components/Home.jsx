import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased selection:bg-primary selection:text-slate-900">
      <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-gradient-to-b from-sky-100 to-green-50 dark:from-slate-900 dark:to-emerald-950">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 -left-10 w-32 h-32 bg-white/40 dark:bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute top-40 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-primary/10 to-transparent"></div>
        </div>

        {/* Top Bar */}
        <div className="relative z-10 flex items-center p-6 justify-between pt-12">
          {/* User Profile */}
          <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-2 pr-5 rounded-full shadow-sm border border-white/50 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-accent-yellow border-2 border-white dark:border-slate-600 overflow-hidden flex items-center justify-center shrink-0">
              <img
                alt="Cute bear avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVZdgIKTj3iefJfrMw2zFHsGR3sgcHB4X0ZFHD8vx9Vf6VAwWuIWNj31LAbok78YO-9FZ3lJxsErmggC85YR9veeTn9sZkLuWmdO2PYq-__GSlNW7o7Xlk6STUjSq4ov9gZZcpULAm-pWyf8DeIXKmf9zHWJ-wY9F90g0cIlKEYRIAXxHu8DamMOzV472ObtqkQiDGon-5R6V2nvGv-fBlAU79TAy8KUJNNs7UXFwlY3xA44ig1bGMVyp-ZKjU6P_Xhv2gIGwSbPc"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Hi, Leo!</span>
              <div className="flex gap-1">
                <span className="material-symbols-outlined text-accent-yellow text-[16px] fill-1">star</span>
                <span className="material-symbols-outlined text-accent-yellow text-[16px] fill-1">star</span>
                <span className="material-symbols-outlined text-accent-yellow text-[16px] fill-1">star</span>
              </div>
            </div>
          </div>

          {/* Parental Gate */}
          <button
            onClick={() => navigate('/insights')}
            className="flex items-center justify-center w-12 h-12 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full shadow-sm border border-white/50 dark:border-slate-700 text-slate-400 hover:text-primary transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>lock</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-6 pb-24">

          {/* Hero / Featured Activity */}
          <div className="mb-8 mt-2">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg relative group cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
              <img
                alt="Adventure Map"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPXuXeCuV6S_po5mvDGvDfEN4Hr08Q0OoLk1LfhGV468spIwDamycUVV51s_bvaGlLc9Q6VDlKQjr5pjfwBpP495q-WBOUPwtHx7oljyzRyVEIjmDD8iYzR-F2P1tv6bQXUGseAOd7Pr0Dy_RUDryMv_wk6pI5Hs__EgVDN59tg0Qk7hZsQobqKmHYnPUR3d4KztnpUXhLM8I3fRgI8qYC-IbZjomzgPlpMG72HJfoA9aVmo7fb6ucEPaY6DcwlaiuCxpATVjI1A0"
              />
              <div className="absolute bottom-4 left-4 z-20 text-white">
                <div className="bg-primary text-slate-900 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2 uppercase tracking-wider">
                  New Adventure
                </div>
                <h2 className="text-2xl font-black tracking-tight drop-shadow-md">Forest Explore</h2>
              </div>
              <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/50">
                <span className="material-symbols-outlined text-white text-[32px] fill-1">play_arrow</span>
              </div>
            </div>
          </div>

          {/* Learning Categories Grid */}
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 pl-1">Let's Play!</h3>
          <div className="grid grid-cols-2 gap-4 pb-6">

            {/* Music Card */}
            <button onClick={() => navigate('/game')} className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-b-4 border-accent-purple active:border-b-0 active:translate-y-1 transition-all h-40 justify-center group">
              <div className="w-16 h-16 bg-accent-purple/20 text-accent-purple rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[40px]">music_note</span>
              </div>
              <span className="font-bold text-lg text-slate-700 dark:text-slate-200">Music</span>
            </button>

            {/* Drawing Card */}
            <button onClick={() => navigate('/game')} className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-b-4 border-accent-red active:border-b-0 active:translate-y-1 transition-all h-40 justify-center group">
              <div className="w-16 h-16 bg-accent-red/20 text-accent-red rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[40px]">palette</span>
              </div>
              <span className="font-bold text-lg text-slate-700 dark:text-slate-200">Drawing</span>
            </button>

            {/* Animals Card */}
            <button onClick={() => navigate('/game/animals')} className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-b-4 border-accent-blue active:border-b-0 active:translate-y-1 transition-all h-40 justify-center group">
              <div className="w-16 h-16 bg-accent-blue/20 text-accent-blue rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-4xl">
                🐾
              </div>
              <span className="font-bold text-lg text-slate-700 dark:text-slate-200">Animals</span>
            </button>

            {/* Numbers Card */}
            <button onClick={() => navigate('/game/math')} className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-b-4 border-accent-yellow active:border-b-0 active:translate-y-1 transition-all h-40 justify-center group">
              <div className="w-16 h-16 bg-accent-yellow/20 text-accent-yellow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[40px]">calculate</span>
              </div>
              <span className="font-bold text-lg text-slate-700 dark:text-slate-200">Numbers</span>
            </button>

            {/* Puzzles Card (full width) */}
            <button onClick={() => navigate('/game')} className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-b-4 border-primary active:border-b-0 active:translate-y-1 transition-all h-40 justify-center group col-span-2">
              <div className="flex w-full items-center justify-between px-4">
                <div className="w-16 h-16 bg-primary/20 text-green-600 dark:text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-[40px]">extension</span>
                </div>
                <div className="flex-1 text-center">
                  <span className="font-bold text-xl text-slate-700 dark:text-slate-200 block">Puzzles</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">Daily Challenge</span>
                </div>
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
                </div>
              </div>
            </button>

          </div>
        </div>

        {/* Floating Action Button */}
        <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 pointer-events-none">
          <button className="pointer-events-auto flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-primary text-slate-900 shadow-[0_8px_30px_rgb(25,230,107,0.4)] border-4 border-white dark:border-slate-800 hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce-slight">
            <span className="material-symbols-outlined text-[40px] fill-1">play_arrow</span>
          </button>
        </div>

        {/* Bottom Tab Navigation */}
        <div className="absolute bottom-0 w-full h-24 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-10 pb-4 z-10 rounded-t-lg">
          <button className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined text-[32px] fill-1">home</span>
          </button>
          <div className="w-12"></div>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[32px]">favorite</span>
          </button>
        </div>

      </div>
    </div>
  )
}
