import { useState, useMemo } from 'react'
import LineChart from '../components/LineChart'
import { calculateTxValue, getTimelineCutoff } from '../utils/calc'

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  bookmaker: 'Unibet',
  type: 'deposit',
  amount: '',
}

// ── Delta Chart ────────────────────────────────────────────────────────────────
function CapitalChart({ txs }) {
  const [timeline, setTimeline] = useState('all')

  const chartData = useMemo(() => {
    const cutoff = getTimelineCutoff(timeline)
    const sorted = [...txs].sort((a, b) => new Date(a.date || a.id) - new Date(b.date || b.id))
    let running = sorted
      .filter((t) => new Date(t.date || t.id) < cutoff)
      .reduce((s, t) => s + calculateTxValue(t), 0)

    const data = sorted
      .filter((t) => new Date(t.date || t.id) >= cutoff)
      .map((t) => ({ x: new Date(t.date || t.id), y: (running += calculateTxValue(t)) }))

    if (data.length === 0) data.push({ x: new Date(), y: running })
    return data
  }, [txs, timeline])

  const TIMELINES = ['1d', '1m', '3m', '6m', '1y', 'all']

  return (
    <div className="lg:col-span-8 glass-card p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Capital Flow</h3>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {TIMELINES.map((t) => (
            <button
              key={t}
              onClick={() => setTimeline(t)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                timeline === t ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[300px] w-full">
        <LineChart
          data={chartData}
          color="#10b981"
          fillColor="rgba(16,185,129,0.05)"
        />
      </div>
    </div>
  )
}

// ── Transactions Page ──────────────────────────────────────────────────────────
export default function Transactions({ txs, onAdd, onDelete, showToast }) {
  const [form, setForm] = useState(EMPTY_FORM)

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) return

    onAdd({ ...form, amount })
    setForm(EMPTY_FORM)
    showToast('Transaction added')
  }

  function handleDelete(id) {
    if (window.confirm('Delete this transaction?')) {
      onDelete(id)
      showToast('Transaction deleted')
    }
  }

  const totalDeposited = txs
    .filter((t) => t.type === 'deposit')
    .reduce((s, t) => s + t.amount, 0)

  const totalWithdrawn = txs
    .filter((t) => t.type === 'withdrawal')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-4 glass-card p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Capital</h3>

          {/* Summary pills */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Deposited</p>
              <p className="text-sm font-black text-emerald-700">+${totalDeposited.toFixed(2)}</p>
            </div>
            <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Withdrawn</p>
              <p className="text-sm font-black text-red-500">-${totalWithdrawn.toFixed(2)}</p>
            </div>
          </div>

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

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Bookmaker</label>
              <select
                value={form.bookmaker}
                onChange={(e) => set('bookmaker', e.target.value)}
                className="w-full p-4 rounded-2xl text-sm bg-slate-50 border-none font-bold mt-1 outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="Unibet">Unibet</option>
                <option value="Betclic">Betclic</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                className="w-full p-4 rounded-2xl text-sm bg-slate-50 border-none font-bold mt-1 outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="deposit">Deposit (+)</option>
                <option value="withdrawal">Withdrawal (-)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Amount ($)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                required
                className="w-full p-4 rounded-2xl text-sm bg-slate-50 border-none mt-1 outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#064e3b] text-white rounded-2xl font-bold text-sm shadow-md mt-2 hover:bg-emerald-900 transition-colors"
            >
              Validate
            </button>
          </form>
        </div>

        {/* Chart */}
        <CapitalChart txs={txs} />
      </div>

      {/* History Table */}
      <div className="glass-card p-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[11px] uppercase border-b border-slate-50">
                <th className="pb-4">Date</th>
                <th className="pb-4">Bookmaker</th>
                <th className="pb-4">Type</th>
                <th className="pb-4 text-right">Amount</th>
                <th className="pb-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-slate-400 italic">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                [...txs].reverse().map((t) => {
                  const isDeposit = t.type === 'deposit'
                  return (
                    <tr key={t.id}>
                      <td className="py-4 text-xs font-medium text-slate-400">
                        {new Date(t.date || t.id).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-sm font-bold">
                        {t.bookmaker || 'N/A'}
                      </td>
                      <td className="py-4 text-sm font-bold capitalize">
                        {isDeposit ? 'Deposit' : 'Withdrawal'}
                      </td>
                      <td className={`py-4 text-right font-black ${isDeposit ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isDeposit ? '+' : '-'}{t.amount.toFixed(2)}$
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-slate-300 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <i className="fas fa-trash-alt text-xs" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
