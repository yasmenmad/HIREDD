import { useState } from 'react'
import { Search, MapPin, Briefcase, ExternalLink, Plus } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function JobsPage() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await api.get('/jobs/search', { params: { query, location: location || undefined } })
      setResults(res.data?.data || [])
      if (!res.data?.data?.length) toast('Aucune offre trouvée', { icon: '🔍' })
    } catch {
      toast.error('Erreur de recherche. Vérifiez votre clé JSearch.')
      setResults([])
    } finally { setLoading(false) }
  }

  const addToTracker = async (job: any) => {
    try {
      await api.post('/candidatures/', {
        entreprise_manuelle: job.employer_name,
        poste_manuel: job.job_title,
        statut: 'sauvegardee',
      })
      toast.success('Ajouté au tracker !')
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Recherche d'offres</h2>
        <p className="text-gray-400 text-sm mt-1">Trouvez votre prochain poste</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Ex: Développeur React, Data Scientist..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="relative w-48">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Lieu (optionnel)"
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          onClick={search}
          disabled={loading}
          className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          {loading ? '...' : 'Chercher'}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map((job: any, i: number) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-100">{job.job_title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Briefcase size={14} />{job.employer_name}</span>
                  {job.job_city && <span className="flex items-center gap-1"><MapPin size={14} />{job.job_city}</span>}
                  {job.job_employment_type && (
                    <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full text-xs">{job.job_employment_type}</span>
                  )}
                </div>
                {job.job_description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{job.job_description}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => addToTracker(job)}
                  className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  Tracker
                </button>
                {job.job_apply_link && (
                  <a
                    href={job.job_apply_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-sm px-3 py-2 rounded-lg transition-colors"
                  >
                    <ExternalLink size={14} />
                    Postuler
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p>Lancez une recherche pour trouver des offres</p>
        </div>
      )}
    </div>
  )
}
