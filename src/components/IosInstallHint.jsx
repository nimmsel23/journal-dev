import { useEffect, useState } from 'react'

export function IosInstallHint() {
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    // Nur auf iOS Safari zeigen (nicht im Standalone-Modus)
    const isIos = /iP(hone|od|ad)/.test(navigator.userAgent)
    const isStandalone = navigator.standalone === true
    const isDismissed = localStorage.getItem('journal-ios-hint-dismissed')

    if (isIos && !isStandalone && !isDismissed) {
      setShowHint(true)
    }
  }, [])

  if (!showHint) return null

  const handleDismiss = () => {
    localStorage.setItem('journal-ios-hint-dismissed', 'true')
    setShowHint(false)
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-600 text-white p-3 flex items-center justify-between gap-3 z-50 text-sm">
      <div className="flex-1">
        <p className="font-medium">App installieren</p>
        <p className="text-amber-100 text-xs mt-0.5">
          Teilen-Symbol → „Zum Home-Bildschirm" für Push-Benachrichtigungen
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 px-3 py-1 bg-amber-700 hover:bg-amber-800 rounded text-xs font-medium whitespace-nowrap"
      >
        OK
      </button>
    </div>
  )
}
