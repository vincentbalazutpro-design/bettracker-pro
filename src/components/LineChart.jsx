import { useEffect, useRef } from 'react'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Filler,
  Tooltip,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Filler, Tooltip)

export default function LineChart({ data, color = '#064e3b', fillColor = 'rgba(6,78,59,0.05)' }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            data,
            borderColor: color,
            tension: 0.3,
            fill: true,
            backgroundColor: fillColor,
            pointRadius: 2,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: false,
        },
        scales: {
          y: { ticks: { font: { size: 10 } } },
          x: {
            type: 'time',
            time: { unit: 'day' },
            ticks: { font: { size: 10 } },
          },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [data, color, fillColor])

  return <canvas ref={canvasRef} />
}
