/**
 * Calculate profit/loss for a single bet
 * @param {Object} bet
 * @returns {number}
 */
export function calculatePL(bet) {
  if (bet.status === 'win') return bet.bet * bet.odd - bet.bet
  if (bet.status === 'loss') return -bet.bet
  return 0 // pending
}

/**
 * Calculate the monetary value of a transaction (positive = deposit, negative = withdrawal)
 * @param {Object} tx
 * @returns {number}
 */
export function calculateTxValue(tx) {
  return tx.type === 'deposit' ? tx.amount : -tx.amount
}

/**
 * Get a Date cutoff for a timeline string
 * @param {string} timeline - '1d' | '1m' | '3m' | '6m' | '1y' | 'all'
 * @returns {Date}
 */
export function getTimelineCutoff(timeline) {
  const now = new Date()
  if (timeline === '1d') return new Date(now.setDate(now.getDate() - 1))
  if (timeline === '1m') return new Date(now.setMonth(now.getMonth() - 1))
  if (timeline === '3m') return new Date(now.setMonth(now.getMonth() - 3))
  if (timeline === '6m') return new Date(now.setMonth(now.getMonth() - 6))
  if (timeline === '1y') return new Date(now.setFullYear(now.getFullYear() - 1))
  return new Date(0)
}

/**
 * Compute global stats from bets + transactions
 * @param {Array} bets
 * @param {Array} txs
 */
export function computeStats(bets, txs) {
  const totalProfit = bets.reduce((s, b) => s + calculatePL(b), 0)
  const capital = txs.reduce((s, t) => s + calculateTxValue(t), 0)
  const balance = capital + totalProfit
  const finished = bets.filter((b) => b.status !== 'pending')
  const totalWagered = finished.reduce((s, b) => s + b.bet, 0)
  const roi = totalWagered > 0 ? (totalProfit / totalWagered) * 100 : 0
  const wins = finished.filter((b) => b.status === 'win').length
  const winRate = finished.length > 0 ? (wins / finished.length) * 100 : 0

  return { totalProfit, capital, balance, roi, winRate, finished, wins }
}
