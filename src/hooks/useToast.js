import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ message: '', visible: false })

  const showToast = useCallback((message) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500)
  }, [])

  return { toast, showToast }
}
