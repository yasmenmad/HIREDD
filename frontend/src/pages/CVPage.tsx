import { useEffect, useState } from 'react'
import { Plus, Trash2, Upload, Sparkles, FileText } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function CVPage() {
  const [cvs, setCvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerate, setShowGenerate] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [questionnaire, setQuestionnaire] = useState({
    nom_complet: '', titre_pro: '', email: '', telephone: '',
    experience: '', formation: '', competences: '', langues: ''
  })

  const fetchCVs = async () => {
    try {
      const res = await api.get('/cv/')
      setCvs(res.data)
    } catch { toast.error('Erreur chargement CVs') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCVs() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      await api.post('/cv/upload', fd)
      toast.success('CV importé !')
      fetchCVs()
    } catch { toast.error("Erreur upload") }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await api.post('/cv/generate', { questionnaire })
      toast.success('CV généré !')
      setShowGenerate(false)
      fetchCVs()
    } catch { toast.error('Erreur génération') }
    finally { setGenerating(false) }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/cv/${id}`)
      setCvs(cvs.filter(c => c.id !== id))
      toast.success('CV supprimé')
    } catch { toast.error('Erreur suppression') }
  }

  if (loading) return <div className="p-8 text-gray-400">Chargement...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Mes CVs</h2>
          <p className="text-gray-400 text-sm mt-1">Gérez vos CVs optimisés ATS</p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer transition-colors border border-gray-700">
            <Upload size={16} />
            Importer PDF/DOCX
            <input type="file" accept=".pdf,.docx" onChange={handleUpload} className="hidden" />
          </label>
          <button
            onClick={() => setShowGenerate(true)}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Sparkles size={16} />
            Générer avec IA
          </button>
        </div>
      </div>

      {/* CV list */}
      {cvs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p>Aucun CV. Importez ou générez votre premier CV.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {cvs.map((cv: any) => (
            <div key={cv.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-100">{cv.titre}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${cv.type_cv === 'genere' ? 'bg-sky-500/10 text-sky-400' : 'bg-violet-500/10 text-violet-400'}`}>
                    {cv.type_cv === 'genere' ? '✨ Généré' : '📎 Importé'}
                  </span>
                </div>
                <button onClick={() => handleDelete(cv.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              {cv.score_ats && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                    <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: `${cv.score_ats}%` }} />
                  </div>
                  <span className="text-xs text-sky-400 font-medium">ATS {cv.score_ats}%</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">{new Date(cv.date_creation).toLocaleDateString('fr-FR')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Generate modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-6">Générer un CV avec IA</h3>
            <div className="space-y-4">
              {[
                ['nom_complet', 'Nom complet'],
                ['titre_pro', 'Titre professionnel'],
                ['email', 'Email'],
                ['telephone', 'Téléphone'],
              ].map(([k, label]) => (
                <div key={k}>
                  <label className="text-sm text-gray-400 mb-1 block">{label}</label>
                  <input
                    type="text"
                    value={questionnaire[k as keyof typeof questionnaire]}
                    onChange={e => setQuestionnaire(q => ({ ...q, [k]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              ))}
              {[
                ['experience', 'Expériences (décrivez vos postes)'],
                ['formation', 'Formation'],
                ['competences', 'Compétences (séparées par virgule)'],
                ['langues', 'Langues'],
              ].map(([k, label]) => (
                <div key={k}>
                  <label className="text-sm text-gray-400 mb-1 block">{label}</label>
                  <textarea
                    value={questionnaire[k as keyof typeof questionnaire]}
                    onChange={e => setQuestionnaire(q => ({ ...q, [k]: e.target.value }))}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowGenerate(false)} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                Annuler
              </button>
              <button onClick={handleGenerate} disabled={generating} className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                {generating ? 'Génération en cours...' : 'Générer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
