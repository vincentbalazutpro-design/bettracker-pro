import { useState, useCallback } from 'react'

const BETS_KEY = 'bt_bets'
const TXS_KEY = 'bt_txs'

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage error:', e)
  }
}

export function useStore() {
  const [bets, setBetsState] = useState(() => loadFromStorage(BETS_KEY, []))
  const [txs, setTxsState] = useState(() => loadFromStorage(TXS_KEY, []))

  const setBets = useCallback((updater) => {
    setBetsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveToStorage(BETS_KEY, next)
      return next
    })
  }, [])

  const setTxs = useCallback((updater) => {
    setTxsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveToStorage(TXS_KEY, next)
      return next
    })
  }, [])

  const addBet = useCallback(
    (bet) => setBets((prev) => [{ ...bet, id: Date.now() }, ...prev]),
    [setBets]
  )

  const updateBet = useCallback(
    (id, data) =>
      setBets((prev) => prev.map((b) => (b.id === id ? { ...data, id } : b))),
    [setBets]
  )

  const deleteBet = useCallback(
    (id) => setBets((prev) => prev.filter((b) => b.id !== id)),
    [setBets]
  )

  const addTx = useCallback(
    (tx) => setTxs((prev) => [...prev, { ...tx, id: Date.now() }]),
    [setTxs]
  )

  const deleteTx = useCallback(
    (id) => setTxs((prev) => prev.filter((t) => t.id !== id)),
    [setTxs]
  )

  const importBets = useCallback(
    (newBets) => setBets((prev) => [...newBets, ...prev]),
    [setBets]
  )

  const clearAll = useCallback(() => {
    localStorage.removeItem(BETS_KEY)
    localStorage.removeItem(TXS_KEY)
    setBetsState([])
    setTxsState([])
  }, [])

  return {
    bets,
    txs,
    addBet,
    updateBet,
    deleteBet,
    addTx,
    deleteTx,
    importBets,
    clearAll,
  }
}
