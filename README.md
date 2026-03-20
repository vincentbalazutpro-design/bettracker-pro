# BetTracker Pro — React

## Stack
- React 18 + Vite
- Tailwind CSS
- Chart.js 4
- localStorage (no backend)

## Structure

```
src/
├── App.jsx                  # Root — routing between pages
├── main.jsx                 # Entry point
├── index.css                # Global styles + Tailwind
├── components/
│   ├── Header.jsx           # Nav + CSV import/export
│   ├── StatCards.jsx        # 4 top KPI cards
│   ├── LineChart.jsx        # Reusable Chart.js line chart
│   ├── TimelineSelector.jsx # 1D/1M/3M/6M/1Y/ALL buttons
│   └── Toast.jsx            # Notification toast
├── pages/
│   ├── Dashboard.jsx        # Calendar + main chart + recent table
│   ├── Analytics.jsx        # Bar chart + doughnut + rankings
│   ├── Bets.jsx             # Bet form + full history
│   └── Transactions.jsx     # Deposit/withdrawal form + chart
├── hooks/
│   ├── useStore.js          # Global state with localStorage
│   └── useToast.js          # Toast notification state
└── utils/
    ├── calc.js              # Pure calculation functions
    └── csv.js               # CSV import/export helpers
```

## Local dev

```bash
npm install
npm run dev
```

## Deploy on Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click Deploy ✓

All data is stored in the browser's `localStorage` — no server required.
