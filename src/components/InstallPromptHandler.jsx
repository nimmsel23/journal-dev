import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export function InstallPromptHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('journal-install-prompt-dismissed');
    if (isDismissed) setDismissed(true);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('journal-install-prompt-dismissed', 'true');
    setDismissed(true);
  };

  if (!showPrompt || dismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg backdrop-blur-sm">
        <Download size={20} className="text-amber-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white">App installieren?</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Direkter Zugriff vom Home-Bildschirm</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold text-xs uppercase active:scale-95 transition-transform"
          >
            Ja
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-xs uppercase active:scale-95 transition-transform"
          >
            Nein
          </button>
        </div>
      </div>
    </div>
  );
}
