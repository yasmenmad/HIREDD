import { useEffect, useState, useRef } from 'react'
import { Plus, Send, StopCircle, MessageSquare, ChevronDown } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function InterviewPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [active, setActive] = useState<any>(null)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [newSession, setNewSession] = useState({ description_manuelle: '', niveau_expertise: 'intermediaire' })
  const messagesEnd = useRef<HTMLDivElement>(null)

  const fetchSessions = async () => {
    const res = await api.get('/interview/')
    setSessions(res.data)
  }

  useEffect(() => { fetchSessions() }, [])
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [active?.historique])

  const startSession = async () => {
    try {
      const res = await api.post('/interview/start', newSession)
      setActive(res.data)
      setShowNew(false)
      fetchSessions()
    } catch { toast.error('Erreur démarrage session') }
  }

  const sendMessage = async () => {
    if (!input.trim() || !active || streaming) return
    const userMsg = input.trim()
    setInput('')
    setStreaming(true)

    // Optimistic update
    setActive((a: any) => ({
      ...a,
      historique: [...(a.historique || []), { role: 'user', content: userMsg }, { role: 'assistant', content: '' }]
    }))

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/interview/${active.id}/message/stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: userMsg })
        }
      )

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value)
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const chunk = line.slice(6)
            if (chunk === '[DONE]') break
            setActive((a: any) => {
              const hist = [...(a.historique || [])]
              const last = hist[hist.length - 1]
              if (last?.role === 'assistant') last.content += chunk
              return { ...a, historique: hist }
            })
          }
        }
      }
    } catch { toast.error('Erreur envoi message') }
    finally { setStreaming(false) }
  }

  const endSession = async () => {
    try {
      const res = await api.post(`/interview/${active.id}/end`)
      setActive(res.data)
      fetchSessions()
      toast.success('Session terminée ! Rapport généré.')
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="flex h-full">
      {/* Sessions sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => setShowNew(true)}
            className="w-full flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-3 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Nouvel entretien
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              className={`w-full text-left p-3 rounded-lg transition-all ${active?.id === s.id ? 'bg-sky-500/10 border border-sky-500/30' : 'hover:bg-gray-800 border border-transparent'}`}
            >
              <p className="text-sm font-medium text-gray-200 truncate">Entretien {s.niveau_expertise}</p>
              <p className="text-xs text-gray-500 mt-0.5">{new Date(s.date_debut).toLocaleDateString('fr-FR')}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${s.statut === 'en_cours' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                {s.statut === 'en_cours' ? '● En cours' : 'Terminée'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {active ? (
          <>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-100">Entretien {active.niveau_expertise}</p>
                <p className="text-xs text-gray-500">{active.historique?.length || 0} messages</p>
              </div>
              {active.statut === 'en_cours' && (
                <button onClick={endSession} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm px-3 py-2 rounded-lg transition-colors">
                  <StopCircle size={16} />
                  Terminer
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(active.historique || []).map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-100'}`}>
                    {msg.content || <span className="opacity-50 animate-pulse">...</span>}
                  </div>
                </div>
              ))}
              {active.rapport && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-sm text-gray-300">
                  <p className="font-semibold text-emerald-400 mb-2">📊 Rapport STAR</p>
                  <p><strong>Score global:</strong> {active.rapport.score_global}/100</p>
                  <p className="mt-1">{active.rapport.resume}</p>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            {active.statut === 'en_cours' && (
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-3">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Votre réponse..."
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={streaming || !input.trim()}
                    className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
              <p>Sélectionnez ou démarrez un entretien</p>
            </div>
          </div>
        )}
      </div>

      {/* New session modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-6">Nouvel entretien</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Description du poste</label>
                <textarea
                  value={newSession.description_manuelle}
                  onChange={e => setNewSession(n => ({ ...n, description_manuelle: e.target.value }))}
                  placeholder="Ex: Développeur Full Stack React/Node.js, 3 ans d'expérience..."
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Niveau</label>
                <select
                  value={newSession.niveau_expertise}
                  onChange={e => setNewSession(n => ({ ...n, niveau_expertise: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="junior">Junior</option>
                  <option value="intermediaire">Intermédiaire</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNew(false)} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-700 transition-colors">Annuler</button>
              <button onClick={startSession} className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Démarrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
