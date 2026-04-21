import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'

const AVATARS = ['🐻', '🐱', '🐶', '🦊', '🐸', '🐼', '🦁', '🐯', '🐧', '🦄', '🐰', '🐨']

export default function ProfileSelect() {
  const navigate = useNavigate()
  const { parent, childProfiles, setActiveChild, refreshChildren, logout } = useAuth()

  const [showAddChild, setShowAddChild] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAge, setNewAge] = useState(4)
  const [newAvatar, setNewAvatar] = useState('🐻')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  function selectChild(child) {
    setActiveChild(child)
    navigate('/', { replace: true })
  }

  async function handleAddChild(e) {
    e.preventDefault()
    setAddError('')
    setAddLoading(true)
    try {
      await api.createChild({ name: newName, age: newAge, avatar: newAvatar })
      await refreshChildren()
      setShowAddChild(false)
      setNewName('')
      setNewAge(4)
      setNewAvatar('🐻')
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-green-50 flex flex-col items-center justify-center p-6 font-display">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👋</div>
          <h1 className="text-2xl font-black text-slate-800">Who's playing today?</h1>
          {parent && <p className="text-slate-500 text-sm mt-1">Logged in as {parent.name}</p>}
        </div>

        {/* Child cards */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {childProfiles.map((child) => (
            <button
              key={child.id}
              onClick={() => selectChild(child)}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-primary/40 hover:shadow-md active:scale-[0.98] transition-all text-left w-72"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                {child.avatar}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">{child.name}</p>
                <p className="text-slate-500 text-sm">Age {child.age}</p>
              </div>
              <span className="material-symbols-outlined text-slate-300 ml-auto">arrow_forward_ios</span>
            </button>
          ))}
        </div>

        {/* Add child */}
        {!showAddChild ? (
          <button
            onClick={() => setShowAddChild(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 font-semibold text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add another child
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-800 mb-4">Add a Child Profile</h3>
            <form onSubmit={handleAddChild} className="flex flex-col gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                placeholder="Child's name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800 text-sm"
              />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">Age:</span>
                <button type="button" onClick={() => setNewAge((a) => Math.max(1, a - 1))} className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-600">−</button>
                <span className="font-bold text-slate-800 w-6 text-center">{newAge}</span>
                <button type="button" onClick={() => setNewAge((a) => Math.min(12, a + 1))} className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-600">+</button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setNewAvatar(a)}
                    className={`text-xl p-1 rounded-xl transition-all ${newAvatar === a ? 'bg-primary/30 ring-2 ring-primary scale-110' : 'hover:bg-slate-100'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              {addError && <p className="text-red-500 text-xs text-center">{addError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAddChild(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">Cancel</button>
                <button type="submit" disabled={addLoading} className="flex-1 py-2 rounded-xl bg-primary text-slate-900 font-bold text-sm disabled:opacity-60">
                  {addLoading ? 'Adding…' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Log out */}
        <button
          onClick={logout}
          className="mt-6 w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
