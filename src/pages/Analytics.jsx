import { useEffect, useRef, useState, useMemo } from 'react'
import {
  Chart,
  BarController,
  DoughnutController,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { calculatePL } from '../utils/calc'

Chart.register(BarController, DoughnutController, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels)

// ── Bar Chart: Net Profit by Sport ─────────────────────────────────────────────
function SportBarChart({ sportsByPL }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sportsByPL.map((s) => s.name),
        datasets: [{
          data: sportsByPL.map((s) => s.pl),
          backgroundColor: sportsByPL.map((s) => (s.pl >= 0 ? '#10b981' : '#ef4444')),
          borderRadius: 8,
        }],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: (v) => '$' + v.toFixed(0),
            color: '#475569',
            font: { weight: 'bold', size: 11 },
            offset: 4,
          },
        },
        scales: {
          y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [sportsByPL])

  return <canvas ref={canvasRef} />
}

// ── Doughnut Chart: Distribution ───────────────────────────────────────────────
function DistributionChart({ labels, data }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#064e3b', '#10b981', '#34d399', '#3b82f6', '#8b5cf6'],
          borderWidth: 0,
        }],
      },
      options: {
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 12 },
            formatter: (value) => (value > 0 ? value : ''),
          },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [labels, data])

  return <canvas ref={canvasRef} />
}

// ── Analytics Page ─────────────────────────────────────────────────────────────
export default function Analytics({ bets }) {
  const [distFilter, setDistFilter] = useState('sport')

  const { bySport, byType, combos, sportsByPL, sportsByCount, sportsByWinRate, bestCombos } =
    useMemo(() => {
      const finished = bets.filter((b) => b.status !== 'pending')
      const bySport = {}
      const byType = {}
      const combos = {}

      finished.forEach((b) => {
        if (!bySport[b.sport]) bySport[b.sport] = { pl: 0, count: 0, wins: 0 }
        bySport[b.sport].pl += calculatePL(b)
        bySport[b.sport].count++
        if (b.status === 'win') bySport[b.sport].wins++

        const type = b.type || 'Single'
        if (!byType[type]) byType[type] = { count: 0 }
        byType[type].count++

        const key = `${b.sport} x ${type}`
        if (!combos[key]) combos[key] = { pl: 0 }
        combos[key].pl += calculatePL(b)
      })

      const sportsByPL = Object.keys(bySport)
        .map((s) => ({ name: s, pl: bySport[s].pl }))
        .sort((a, b) => b.pl - a.pl)

      const sportsByCount = Object.keys(bySport)
        .map((s) => ({ name: s, val: bySport[s].count }))
        .sort((a, b) => b.val - a.val)

      const sportsByWinRate = Object.keys(bySport)
        .map((s) => ({ name: s, val: (bySport[s].wins / bySport[s].count) * 100 }))
        .sort((a, b) => b.val - a.val)

      const bestCombos = Object.keys(combos)
        .map((k) => ({ name: k, val: combos[k].pl }))
        .sort((a, b) => b.val - a.val)
        .slice(0, 5)

      return { bySport, byType, combos, sportsByPL, sportsByCount, sportsByWinRate, bestCombos }
    }, [bets])

  const distLabels = distFilter === 'sport' ? Object.keys(bySport) : Object.keys(byType)
  const distData =
    distFilter === 'sport'
      ? Object.values(bySport).map((v) => v.count)
      : Object.values(byType).map((v) => v.count)

  const isEmpty = bets.filter((b) => b.status !== 'pending').length === 0

  if (isEmpty) {
    return (
      <section className="space-y-6">
        <div className="glass-card p-16 text-center">
          <i className="fas fa-chart-bar text-4xl text-slate-200 mb-4" />
          <p className="text-slate-400 italic">No resolved bets to analyze yet.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Net Profit by Sport ($)</h3>
          <div className="h-[300px]">
            <SportBarChart sportsByPL={sportsByPL} />
          </div>
        </div>

        {/* Doughnut */}
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Distribution</h3>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              {['sport', 'type'].map((f) => (
                <button
                  key={f}
                  onClick={() => setDistFilter(f)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                    distFilter === f ? 'bg-slate-200 text-[#064e3b]' : 'text-slate-500'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <DistributionChart labels={distLabels} data={distData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bets Count */}
        <div className="glass-card p-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-6 tracking-widest text-center">
            Number of Bets
          </h4>
          <div className="space-y-2">
            {sportsByCount.map((s) => (
              <div key={s.name} className="metric-row">
                <span className="text-xs font-bold text-slate-600">{s.name}</span>
                <span className="text-xs font-black text-slate-800">{s.val} bets</span>
              </div>
            ))}
          </div>
        </div>

        {/* Win Rate by Sport */}
        <div className="glass-card p-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-6 tracking-widest text-center">
            Win Rate by Sport
          </h4>
          <div className="space-y-2">
            {sportsByWinRate.map((s) => (
              <div key={s.name} className="metric-row">
                <span className="text-xs font-bold text-slate-600">{s.name}</span>
                <span className="text-xs font-black text-emerald-600">{s.val.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Combos */}
        <div className="glass-card p-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-6 tracking-widest text-center">
            Best Combinations
          </h4>
          <div className="space-y-2">
            {bestCombos.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center">No data</p>
            ) : (
              bestCombos.map((c) => (
                <div key={c.name} className="metric-row">
                  <span className="text-xs font-bold text-slate-600">{c.name}</span>
                  <span className={`text-xs font-black ${c.val >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {c.val >= 0 ? '+' : ''}{c.val.toFixed(2)}$
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
