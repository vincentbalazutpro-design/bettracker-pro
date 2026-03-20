import { useState, useMemo } from 'react'
import LineChart from '../components/LineChart'
import TimelineSelector from '../components/TimelineSelector'
import { calculatePL, calculateTxValue, getTimelineCutoff, computeStats } from '../utils/calc'

// ── Calendar ──────────────────────────────────────────────────────────────────
function ProfitCalendar({ bets }) {
  const [monthDate, setMonthDate] = useState(new Date())

  const y = monthDate.getFullYear()
  const m = monthDate.getMonth()

  const { dayData, mPL, mWins, mTotal } = useMemo(() => {
    const dayData = {}
    let mPL = 0, mWins = 0, mTotal = 0
    bets.forEach((b) => {
      const d = new Date(b.date)
      if (d.getFullYear() === y && d.getMonth() === m) {
        dayData[d.getDate()] = (dayData[d.getDate()] || 0) + calculatePL(b)
        if (b.status !== 'pending') {
          mPL += calculatePL(b)
          mTotal++
          if (b.status === 'win') mWins++
        }
      }
    })
    return { dayData, mPL, mWins, mTotal }
  }, [bets, y, m])

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(monthDate)
  const firstDay = (new Date(y, m, 1).getDay() + 6) % 7
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const winRate = mTotal > 0 ? (mWins / mTotal) * 100 : 0

  function changeMonth(dir) {
    setMonthDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + dir)
      return d
    })
  }

  return (
    <div className="lg:col-span-4 glass-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-800">Profit Calendar</h3>
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <i className="fas fa-chevron-left text-[10px]" />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <i className="fas fa-chevron-right text-[10px]" />
            </button>
          </div>
        </div>

        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-4">
          {monthLabel}
        </p>

        <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-slate-300 font-bold mb-3">
          {['M','T','W','T','F','S','S'].map((d, i) => <span key={i}>{d}</span>)}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const val = dayData[day] || 0
            return (
              <div
                key={day}
                className={`aspect-square flex items-center justify-center rounded-xl text-[10px] font-bold ${
                  val > 0
                    ? 'bg-emerald-600 text-white'
                    : val < 0
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                {day}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase">Monthly Winrate</span>
          <span className="text-lg font-bold text-emerald-700">{winRate.toFixed(0)}%</span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase">Net P&L (Month)</span>
          <span className="text-lg font-bold text-slate-700">
            {mPL >= 0 ? '+' : ''}{mPL.toFixed(2)}$
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Main Chart ─────────────────────────────────────────────────────────────────
function MainChart({ bets, txs }) {
  const [timeline, setTimeline] = useState('all')
  const [mode, setMode] = useState('bets') // 'bets' | 'capital'

  const { totalProfit, capital } = computeStats(bets, txs)

  const chartData = useMemo(() => {
    const cutoff = getTimelineCutoff(timeline)
    const events =
      mode === 'bets'
        ? bets.map((b) => ({ x: new Date(b.date), y: calculatePL(b) }))
        : txs.map((t) => ({ x: new Date(t.date || t.id), y: calculateTxValue(t) }))

    events.sort((a, b) => a.x - b.x)
    let running = events.filter((e) => e.x < cutoff).reduce((s, e) => s + e.y, 0)
    const filtered = events.filter((e) => e.x >= cutoff)
    const data = filtered.map((e) => ({ x: e.x, y: (running += e.y) }))
    if (data.length === 0) data.push({ x: new Date(), y: running })
    return data
  }, [bets, txs, timeline, mode])

  const heroValue = mode === 'bets' ? totalProfit : capital

  return (
    <div className="lg:col-span-8 glass-card p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {['bets', 'capital'].map((t) => (
              <button
                key={t}
                onClick={() => setMode(t)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border border-slate-100 ${
                  mode === t ? 'bg-slate-100 text-[#064e3b]' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t === 'bets' ? "Bets P&L" : "Capital"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl font-extrabold ${
                mode === 'bets'
                  ? heroValue >= 0 ? 'text-emerald-700' : 'text-red-500'
                  : 'text-slate-800'
              }`}
            >
              ${heroValue.toLocaleString()}
            </span>
          </div>
        </div>
        <TimelineSelector active={timeline} onChange={setTimeline} />
      </div>
      <div className="h-[380px] w-full">
        <LineChart data={chartData} />
      </div>
    </div>
  )
}

// ── Summary Table ──────────────────────────────────────────────────────────────
function SummaryTable({ bets, onNavigate }) {
  const recent = [...bets].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
        <button
          onClick={() => onNavigate('add-bet')}
          className="text-xs font-bold text-emerald-700 hover:underline"
        >
          View All History
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[11px] uppercase border-b border-slate-50">
              {['Date','Sport','Type','Odds','Stake','Status','Net P&L'].map((h) => (
                <th key={h} className="pb-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recent.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-slate-400 italic">
                  No bets yet. Start by logging one in the Bets tab.
                </td>
              </tr>
            ) : (
              recent.map((b) => {
                const pl = calculatePL(b)
                return (
                  <tr key={b.id}>
                    <td className="py-4 text-xs font-medium text-slate-400">
                      {new Date(b.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-sm font-bold">{b.sport}</td>
                    <td className="py-4 text-[10px] uppercase text-slate-400">{b.type || 'Single'}</td>
                    <td className="py-4 font-bold">x{b.odd.toFixed(2)}</td>
                    <td className="py-4 font-bold">${b.bet.toFixed(2)}</td>
                    <td className="py-4">
                      <span
                        className={`text-[9px] px-2 py-1 rounded font-black ${
                          b.status === 'win'
                            ? 'bg-emerald-50 text-emerald-600'
                            : b.status === 'loss'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className={`py-4 font-bold ${pl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {pl.toFixed(2)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────
export default function Dashboard({ bets, txs, onNavigate }) {
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ProfitCalendar bets={bets} />
        <MainChart bets={bets} txs={txs} />
      </div>
      <SummaryTable bets={bets} onNavigate={onNavigate} />
    </section>
  )
}
