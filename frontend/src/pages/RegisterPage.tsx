import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form.nom, form.prenom, form.email, form.mot_de_passe)
      toast.success('Compte créé ! Connectez-vous.')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur inscription')
    } finally {
      setLoading(false)
    }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Hired<span className="text-sky-400">.</span></h1>
          <p className="text-gray-400 mt-2">Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 border border-gray-800 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[['nom', 'Nom'], ['prenom', 'Prénom']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
                <input
                  type="text"
                  value={form[k as keyof typeof form]}
                  onChange={e => set(k, e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
            <input
              type="password"
              value={form.mot_de_passe}
              onChange={e => set('mot_de_passe', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Création...' : "Créer mon compte"}
          </button>

          <p className="text-center text-gray-400 text-sm">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
