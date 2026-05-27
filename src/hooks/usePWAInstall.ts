import { useState, useEffect } from 'react';

// Custom type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Check if user already dismissed the prompt
    const isDismissed = localStorage.getItem('pwa_install_dismissed') === 'true';
    if (isDismissed) {
      return;
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const detectIOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(detectIOS);

    // 4. Handle Android/Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Show prompt if not iOS (since we handle iOS via its own manual condition below)
      if (!detectIOS) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. For iOS, since it doesn't support beforeinstallprompt, we manually set installable if it's iOS and Safari (or not standalone)
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|chrome|firefox/.test(userAgent);
    if (detectIOS && isSafari && !isStandalone) {
      setIsInstallable(true);
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (isIOS) {
      // iOS doesn't support programmatic trigger, we show the manual prompt/guide
      return true;
    }

    if (!deferredPrompt) {
      return false;
    }

    // Trigger native Android/Chrome prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem('pwa_install_dismissed', 'true');
      setShowPrompt(false);
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }
    
    return false;
  };

  const dismissPrompt = () => {
    localStorage.setItem('pwa_install_dismissed', 'true');
    setShowPrompt(false);
  };

  const resetDismissal = () => {
    localStorage.removeItem('pwa_install_dismissed');
    // If it is installable (e.g. prompt is saved or iOS Safari), we can show it again
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (!isStandalone && isInstallable) {
      setShowPrompt(true);
    }
  };

  return {
    isInstallable,
    isIOS,
    showPrompt,
    installApp,
    dismissPrompt,
    resetDismissal,
  };
};
