const TIMELINES = ['1d', '1m', '3m', '6m', '1y', 'all']

export default function TimelineSelector({ active, onChange }) {
  return (
    <div className="flex bg-slate-100 p-1 rounded-xl">
      {TIMELINES.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            active === t ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          {t.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
