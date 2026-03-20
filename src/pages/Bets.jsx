import { useState, useMemo, useEffect } from 'react'
import TimelineSelector from '../components/TimelineSelector'
import { calculatePL, getTimelineCutoff } from '../utils/calc'

const SPORTS = [
  { value: 'Football', label: '⚽ Football' },
  { value: 'Tennis', label: '🎾 Tennis' },
  { value: 'Basketball', label: '🏀 Basketball' },
  { value: 'Esports', label: '🎮 Esports' },
  { value: 'Other', label: '🎲 Other' },
]

const STATUSES = [
  { value: 'pending', label: '⏳ Pending' },
  { value: 'win', label: '✅ Won' },
  { value: 'loss', label: '❌ Lost' },
]

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  sport: 'Football',
  type: 'Single',
  odd: '',
  bet: '',
  status: 'pending',
}

// ── Bet Form ───────────────────────────────────────────────────────────────────
function BetForm({ onAdd, onUpdate, editingBet, onCancelEdit, showToast }) {
  const [form, setForm] = useState(EMPTY_FORM)

  // Met à jour le formulaire quand on clique sur "Editer" dans la liste
  useEffect(() => {
    if (editingBet) {
      setForm({ ...editingBet })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [editingBet])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const data = {
      ...form,
      odd: parseFloat(form.odd),
      bet: parseFloat(form.bet),
    }

    if (isNaN(data.odd) || isNaN(data.bet)) return

    if (editingBet) {
      onUpdate(editingBet.id, data)
      showToast('Bet updated')
    } else {
      onAdd(data)
      showToast('Bet saved')
    }

    setForm(EMPTY_FORM)
    if (onCancelEdit) onCancelEdit()
  }

  return (
    <div className="glass-card p-8 h-fit">
      <h3 className="text-lg font-bold text-slate-800 mb-6">
        {editingBet ? 'Edit Bet' : 'Log a Bet'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            required
            className="w-full p-4 rounded-2xl text-sm bg-slate-50 border-none mt-1 outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Sport</label>
            <select
              value={form.sport}
              onChange={(e) => set('sport', e.target.value)}
              className="w-full p-4 rounded-2xl text-sm bg-slate-50 border-none mt-1 outline-none focus:ring-2 focus:ring-emerald-200"
            >
              {SPORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
              className="w-full p-4 rounded-2xl text-sm bg-slate-50 border-none mt-1 outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="Single">Single</option>
              <option value="Combo">Combo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Odds</label>
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="1.85"
              value={form.odd}
              onChange={(e) => set('odd', e.target.value)}
              required
              className="w-full p-4 rounded-2xl text-sm bg-slate-50 border-none mt-1 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Stake</label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="20.00"
              value={form.bet}
              onChange={(e) => set('bet', e.target.value)}
              required
              className="w-full p-4 rounded-2xl text-sm bg-slate-50 border-none mt-1 outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className="w-full p-4 rounded-2xl text-sm bg-slate-50 border-none mt-1 outline-none focus:ring-2 focus:ring-emerald-200"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-4 bg-[#064e3b] text-white rounded-2xl font-bold text-sm mt-4 shadow-lg hover:bg-emerald-900 transition-colors"
          >
            {editingBet ? 'Update Bet' : 'Add Bet'}
          </button>
          {editingBet && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-4 bg-slate-200 text-slate-600 rounded-2xl font-bold text-sm mt-4 hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// ── Bet Item ───────────────────────────────────────────────────────────────────
function BetItem({ bet, onEdit, onDelete }) {
  const pl = calculatePL(bet)

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
      <div>
        <p className="text-sm font-bold">
          {bet.sport} — x{Number(bet.odd).toFixed(2)}
        </p>
        <p className="text-[10px] text-slate-400 font-bold">
          {new Date(bet.date).toLocaleDateString()} • {bet.type || 'Single'}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`text-xs font-black ${pl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {pl >= 0 ? '+' : ''}{pl.toFixed(2)}$
          </p>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-black ${bet.status === 'win'
                ? 'bg-emerald-50 text-emerald-600'
                : bet.status === 'loss'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-slate-200 text-slate-500'
              }`}
          >
            {bet.status.toUpperCase()}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(bet)}
            className="p-2 text-slate-300 hover:text-emerald-600 transition-colors"
          >
            <i className="fas fa-pen text-[10px]" />
          </button>
          <button
            onClick={() => onDelete(bet.id)}
            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
          >
            <i className="fas fa-trash text-[10px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Bets Page ──────────────────────────────────────────────────────────────────
export default function Bets({ bets, onAdd, onUpdate, onDelete, showToast }) {
  const [timeline, setTimeline] = useState('all')
  const [editingBet, setEditingBet] = useState(null) // État pour suivre le pari en cours d'édition

  const filteredBets = useMemo(() => {
    const cutoff = getTimelineCutoff(timeline)
    return [...bets]
      .filter((b) => new Date(b.date) >= cutoff)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [bets, timeline])

  function handleEditInitiate(bet) {
    setEditingBet(bet)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(id) {
    if (window.confirm('Supprimer ce pari ?')) {
      onDelete(id)
      showToast('Bet deleted')
      // Si on supprime le pari qu'on était en train d'éditer, on annule l'édition
      if (editingBet?.id === id) setEditingBet(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BetForm
          onAdd={onAdd}
          onUpdate={onUpdate}
          editingBet={editingBet}
          onCancelEdit={() => setEditingBet(null)}
          showToast={showToast}
        />

        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-800">Full History</h3>
            <TimelineSelector active={timeline} onChange={setTimeline} />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredBets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-sm">
                No bets found for this period.
              </div>
            ) : (
              filteredBets.map((b) => (
                <BetItem
                  key={b.id}
                  bet={b}
                  onEdit={handleEditInitiate}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}