import { useState } from 'react'
import Header from './components/Header'
import Toast from './components/Toast'
import StatCards from './components/StatCards'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Bets from './pages/Bets'
import Transactions from './pages/Transactions'
import { useStore } from './hooks/useStore'
import { useToast } from './hooks/useToast'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const { toast, showToast } = useToast()
  const {
    bets,
    txs,
    addBet,
    updateBet,
    deleteBet,
    addTx,
    deleteTx,
    importBets,
    clearAll,
  } = useStore()

  function navigate(page) {
    setActivePage(page)
  }

  return (
    <div className="p-4 md:p-6">
      <Header
        activePage={activePage}
        onNavigate={navigate}
        bets={bets}
        onImport={importBets}
        onClear={clearAll}
        showToast={showToast}
      />

      <main className="max-w-[1600px] mx-auto space-y-6">
        {/* KPI cards — always visible */}
        <StatCards bets={bets} txs={txs} />

        {/* Pages */}
        {activePage === 'dashboard' && (
          <Dashboard bets={bets} txs={txs} onNavigate={navigate} />
        )}
        {activePage === 'analytics' && (
          <Analytics bets={bets} />
        )}
        {activePage === 'add-bet' && (
          <Bets
            bets={bets}
            onAdd={addBet}
            onUpdate={updateBet}
            onDelete={deleteBet}
            showToast={showToast}
          />
        )}
        {activePage === 'transactions' && (
          <Transactions
            txs={txs}
            onAdd={addTx}
            onDelete={deleteTx}
            showToast={showToast}
          />
        )}
      </main>

      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
}
