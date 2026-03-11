import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, Kanban, MessageSquare, TrendingUp, Clock } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ cvs: 0, candidatures: 0, sessions: 0 })

  useEffect(() => {
    Promise.all([
      api.get('/cv/').catch(() => ({ data: [] })),
      api.get('/candidatures/').catch(() => ({ data: [] })),
      api.get('/interview/').catch(() => ({ data: [] })),
    ]).then(([cvs, cands, sessions]) => {
      setStats({ cvs: cvs.data.length, candidatures: cands.data.length, sessions: sessions.data.length })
    })
  }, [])

  const cards = [
    { icon: FileText, label: 'CVs créés', value: stats.cvs, to: '/cv', color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { icon: Kanban, label: 'Candidatures', value: stats.candidatures, to: '/tracker', color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { icon: MessageSquare, label: 'Entretiens', value: stats.sessions, to: '/interview', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ]

  const quickActions = [
    { icon: FileText, label: 'Générer un CV', desc: 'Avec assistant IA', to: '/cv', color: 'sky' },
    { icon: Search, label: 'Chercher des offres', desc: 'Moteur de recherche', to: '/jobs', color: 'violet' },
    { icon: MessageSquare, label: 'Simuler un entretien', desc: "S'entraîner avec l'IA", to: '/interview', color: 'emerald' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white">
          Bonjour, {user?.prenom} 👋
        </h2>
        <p className="text-gray-400 mt-1">Voici un aperçu de votre activité</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {cards.map(({ icon: Icon, label, value, to, color, bg }) => (
          <Link key={to} to={to} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={color} size={22} />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Actions rapides</h3>
      <div className="grid grid-cols-3 gap-4">
        {quickActions.map(({ icon: Icon, label, desc, to }) => (
          <Link
            key={to}
            to={to}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-sky-500/50 hover:bg-gray-800/50 transition-all flex items-center gap-4"
          >
            <Icon className="text-sky-400 shrink-0" size={20} />
            <div>
              <p className="text-sm font-medium text-gray-200">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
