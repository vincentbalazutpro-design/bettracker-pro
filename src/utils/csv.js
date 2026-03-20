import { calculatePL } from './calc'

/**
 * Export bets array to a CSV file download
 * @param {Array} bets
 */
export function exportBetsToCSV(bets) {
  if (bets.length === 0) return false

  const headers = ['Date', 'Sport', 'Type', 'Odd', 'Stake', 'Status', 'PL']
  const rows = bets.map((b) => [
    b.date,
    b.sport,
    b.type || 'Single',
    b.odd,
    b.bet,
    b.status,
    calculatePL(b).toFixed(2),
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    headers.join(',') +
    '\n' +
    rows.map((r) => r.join(',')).join('\n')

  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csvContent))
  link.setAttribute('download', 'bet_tracker_data.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  return true
}

/**
 * Parse CSV text into bets array
 * @param {string} text
 * @returns {Array}
 */
export function parseCSVToBets(text) {
  const lines = text.split('\n')
  const newBets = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length < 6) continue

    const status = cols[5].trim().toLowerCase()
    if (!['win', 'loss', 'pending'].includes(status)) continue

    const odd = parseFloat(cols[3])
    const bet = parseFloat(cols[4])
    if (isNaN(odd) || isNaN(bet)) continue

    newBets.push({
      date: cols[0].trim(),
      sport: cols[1].trim(),
      type: cols[2].trim() || 'Single',
      odd,
      bet,
      status,
      id: Date.now() + i,
    })
  }

  return newBets
}
