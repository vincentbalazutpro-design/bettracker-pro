import { useRef } from 'react'
import { exportBetsToCSV, parseCSVToBets } from '../utils/csv'

const PAGES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'add-bet', label: 'Bets' },
  { id: 'transactions', label: 'D / W' },
]

export default function Header({ activePage, onNavigate, bets, onImport, onClear, showToast }) {
  const fileInputRef = useRef(null)

  function handleExport() {
    const ok = exportBetsToCSV(bets)
    showToast(ok ? 'Export successful' : 'No data to export')
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const newBets = parseCSVToBets(ev.target.result)
      if (newBets.length > 0) {
        onImport(newBets)
        showToast(`${newBets.length} bets imported`)
      } else {
        showToast('No valid bets found in CSV')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleClear() {
    if (window.confirm('Clear all data? This action cannot be undone.')) {
      onClear()
      showToast('Data cleared')
    }
  }

  return (
    <header className="max-w-[1600px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#064e3b] rounded-xl flex items-center justify-center shadow-lg">
          <i className="fas fa-chart-pie text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">BetTracker</h1>
      </div>

      {/* Nav */}
      <nav className="glass-card p-1 flex gap-1 overflow-x-auto">
        {PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => onNavigate(p.id)}
            className={`px-6 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activePage === p.id
                ? 'bg-[#064e3b] text-white'
                : 'text-slate-500 hover:bg-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          title="Export CSV"
          className="h-10 px-3 rounded-xl bg-white border border-slate-100 flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <i className="fas fa-file-export" />
          <span className="hidden xl:inline text-xs font-bold uppercase">Export</span>
        </button>

        <button
          onClick={handleImportClick}
          title="Import CSV"
          className="h-10 px-3 rounded-xl bg-white border border-slate-100 flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <i className="fas fa-file-import" />
          <span className="hidden xl:inline text-xs font-bold uppercase">Import</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={handleClear}
          title="Reset Data"
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
        >
          <i className="fas fa-sync-alt" />
        </button>

        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm ml-2">
          <img
            src="/profile.jpg"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}
