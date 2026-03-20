import { computeStats } from '../utils/calc'

export default function StatCards({ bets, txs }) {
  const { balance, totalProfit, roi, winRate } = computeStats(bets, txs)

  const roiPositive = roi >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Bankroll */}
      <div className="glass-card p-8">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Total Bankroll
        </span>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-extrabold text-slate-800">$</span>
          <span className="text-4xl font-extrabold text-slate-800 tracking-tight">
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Global Net Profit */}
      <div className="glass-card p-8 border-l-4 border-l-emerald-600">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Global Net Profit
        </span>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-extrabold text-slate-800">$</span>
          <span
            className={`text-4xl font-extrabold tracking-tight ${
              totalProfit >= 0 ? 'text-emerald-700' : 'text-red-500'
            }`}
          >
            {totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* ROI */}
      <div className="glass-card p-8">
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Cumulative ROI
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              roiPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {roiPositive ? '+' : ''}
            {roi.toFixed(0)}%
          </span>
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span
            className={`text-4xl font-extrabold tracking-tight ${
              roiPositive ? 'text-slate-800' : 'text-red-500'
            }`}
          >
            {roi.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Win Rate */}
      <div className="glass-card p-8">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Global Win Rate
        </span>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-extrabold text-slate-800 tracking-tight">
            {winRate.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  )
}
