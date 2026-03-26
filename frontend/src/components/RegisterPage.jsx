import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AVATARS = ['🐻', '🐱', '🐶', '🦊', '🐸', '🐼', '🦁', '🐯', '🐧', '🦄', '🐰', '🐨']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, setActiveChild } = useAuth()

  const [step, setStep] = useState(1) // 1 = parent info, 2 = first child info
  const [parentName, setParentName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState(4)
  const [childAvatar, setChildAvatar] = useState('🐻')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleNextStep(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setStep(2)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const kids = await register({
        parent_name: parentName,
        email,
        password,
        child_name: childName,
        child_age: childAge,
        child_avatar: childAvatar,
      })
      // Registration always creates exactly one child — auto-select and go straight in
      if (kids.length > 0) setActiveChild(kids[0])
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-50 flex items-center justify-center p-6 font-display">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🌳</div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">KidsLearn</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {step === 1 ? 'Create your parent account' : "Now, set up your child's profile"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary text-slate-900' : 'bg-slate-200 text-slate-500'}`}>1</div>
          <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary text-slate-900' : 'bg-slate-200 text-slate-500'}`}>2</div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                  placeholder="e.g. Sarah"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 text-sm"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary text-slate-900 font-bold rounded-xl shadow-sm hover:bg-green-400 active:scale-95 transition-all"
              >
                Next →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Child's Name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  required
                  placeholder="e.g. Emma"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildAge((a) => Math.max(1, a - 1))}
                    className="w-10 h-10 rounded-full bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >−</button>
                  <span className="text-2xl font-bold text-slate-800 w-10 text-center">{childAge}</span>
                  <button
                    type="button"
                    onClick={() => setChildAge((a) => Math.min(12, a + 1))}
                    className="w-10 h-10 rounded-full bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >+</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Pick an Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setChildAvatar(a)}
                      className={`text-2xl p-1.5 rounded-xl transition-all ${childAvatar === a ? 'bg-primary/30 ring-2 ring-primary scale-110' : 'hover:bg-slate-100'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 flex-grow py-3 bg-primary text-slate-900 font-bold rounded-xl shadow-sm hover:bg-green-400 active:scale-95 transition-all disabled:opacity-60"
                >
                  {loading ? 'Creating…' : "Let's Go! 🎉"}
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-slate-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Your child's default parental PIN is <strong>0000</strong>. Change it in Parent Dashboard.
        </p>
      </div>
    </div>
  )
}
