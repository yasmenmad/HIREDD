import { useEffect, useState } from 'react'
import { Save, User } from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore()
  const [profil, setProfil] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/users/me/profil').then(r => setProfil(r.data)).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/users/me/profil', profil)
      toast.success('Profil mis à jour')
      fetchMe()
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  const set = (k: string, v: any) => setProfil((p: any) => ({ ...p, [k]: v }))

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Mon profil</h2>
        <p className="text-gray-400 text-sm mt-1">Informations utilisées pour le matching IA</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-800">
          <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-2xl font-bold">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-100">{user?.prenom} {user?.nom}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="text-xs bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full mt-1 inline-block">{user?.role}</span>
          </div>
        </div>

        {profil && (
          <>
            {[['titre_pro', 'Titre professionnel', 'text'], ['localisation', 'Localisation', 'text']].map(([k, label, type]) => (
              <div key={k}>
                <label className="text-sm text-gray-400 mb-2 block">{label}</label>
                <input
                  type={type}
                  value={profil[k] || ''}
                  onChange={e => set(k, e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            ))}

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Résumé professionnel</label>
              <textarea
                value={profil.resume || ''}
                onChange={e => set('resume', e.target.value)}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Niveau d'expérience</label>
              <select
                value={profil.niveau_exp || ''}
                onChange={e => set('niveau_exp', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Sélectionner...</option>
                <option value="junior">Junior</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="senior">Senior</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Compétences (séparées par virgule)</label>
              <input
                type="text"
                value={(profil.competences || []).join(', ')}
                onChange={e => set('competences', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                placeholder="React, Python, SQL..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              <Save size={16} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
