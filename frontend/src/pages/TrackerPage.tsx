import { useEffect, useState } from 'react'
import { Plus, Trash2, Kanban } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const COLUMNS = [
  { key: 'sauvegardee', label: 'Sauvegardée', color: 'text-gray-400', border: 'border-gray-700' },
  { key: 'envoyee', label: 'Envoyée', color: 'text-sky-400', border: 'border-sky-500/30' },
  { key: 'entretien', label: 'Entretien', color: 'text-violet-400', border: 'border-violet-500/30' },
  { key: 'offre_recue', label: 'Offre reçue', color: 'text-emerald-400', border: 'border-emerald-500/30' },
  { key: 'refusee', label: 'Refusée', color: 'text-red-400', border: 'border-red-500/30' },
]

export default function TrackerPage() {
  const [candidatures, setCandidatures] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newCand, setNewCand] = useState({ entreprise_manuelle: '', poste_manuel: '', notes: '' })

  const fetch = async () => {
    const res = await api.get('/candidatures/')
    setCandidatures(res.data)
  }

  useEffect(() => { fetch() }, [])

  const handleAdd = async () => {
    if (!newCand.entreprise_manuelle || !newCand.poste_manuel) return toast.error('Remplissez entreprise et poste')
    try {
      await api.post('/candidatures/', { ...newCand, statut: 'sauvegardee', priorite: 'moyen' })
      toast.success('Candidature ajoutée')
      setShowAdd(false)
      setNewCand({ entreprise_manuelle: '', poste_manuel: '', notes: '' })
      fetch()
    } catch { toast.error('Erreur') }
  }

  const moveCard = async (id: string, newStatut: string) => {
    await api.patch(`/candidatures/${id}`, { statut: newStatut })
    fetch()
  }

  const deleteCard = async (id: string) => {
    await api.delete(`/candidatures/${id}`)
    setCandidatures(c => c.filter(x => x.id !== id))
    toast.success('Supprimé')
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Tracker candidatures</h2>
          <p className="text-gray-400 text-sm mt-1">{candidatures.length} candidature{candidatures.length !== 1 ? 's' : ''} suivie{candidatures.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map(col => {
          const cards = candidatures.filter(c => c.statut === col.key)
          return (
            <div key={col.key} className={`flex-shrink-0 w-64 bg-gray-900/50 rounded-xl border ${col.border} p-4`}>
              <div className={`flex items-center gap-2 mb-4 ${col.color} font-medium text-sm`}>
                <span>{col.label}</span>
                <span className="ml-auto bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">{cards.length}</span>
              </div>
              <div className="space-y-3">
                {cards.map(c => (
                  <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{c.poste_manuel || 'Poste'}</p>
                        <p className="text-xs text-gray-500 truncate">{c.entreprise_manuelle || 'Entreprise'}</p>
                      </div>
                      <button onClick={() => deleteCard(c.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {c.notes && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{c.notes}</p>}
                    <select
                      value={c.statut}
                      onChange={e => moveCard(c.id, e.target.value)}
                      className="mt-3 w-full bg-gray-800 border border-gray-700 rounded text-xs text-gray-400 px-2 py-1 focus:outline-none"
                    >
                      {COLUMNS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-6">Nouvelle candidature</h3>
            <div className="space-y-4">
              {[['entreprise_manuelle', 'Entreprise'], ['poste_manuel', 'Poste']].map(([k, label]) => (
                <div key={k}>
                  <label className="text-sm text-gray-400 mb-1 block">{label}</label>
                  <input
                    type="text"
                    value={newCand[k as keyof typeof newCand]}
                    onChange={e => setNewCand(n => ({ ...n, [k]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Notes</label>
                <textarea
                  value={newCand.notes}
                  onChange={e => setNewCand(n => ({ ...n, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-700 transition-colors">Annuler</button>
              <button onClick={handleAdd} className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
