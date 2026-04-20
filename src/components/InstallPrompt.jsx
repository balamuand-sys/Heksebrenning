import React, { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';

export const InstallPrompt = () => {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  useEffect(() => {
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);
    const isAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isInStandaloneMode() || isAndroidStandalone) return;

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (isIOS) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [isIOS]);

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 bg-orange-600/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl z-[150] flex justify-between items-start animate-in slide-in-from-top-4 border border-orange-400/30">
      <div className="flex gap-4">
        <div className="bg-zinc-950/30 p-2 rounded-xl h-fit text-white">
          <Download size={24} />
        </div>
        <div>
          <h3 className="font-bold text-sm">Få App-følelsen!</h3>
          {isIOS ? (
            <p className="text-xs text-orange-100 mt-1 leading-relaxed">
              Trykk på <Share size={12} className="inline mx-1" /> (Del) i Safari, rull ned og velg <strong>«Legg til på hjemskjerm»</strong>.
            </p>
          ) : (
            <p className="text-xs text-orange-100 mt-1 leading-relaxed">
              {deferredPrompt ? (
                <button onClick={handleAndroidInstall} className="underline font-bold">
                  Trykk her for å installere appen
                </button>
              ) : (
                <>Trykk på meny-ikonet <strong>(⋮)</strong> i Chrome og velg <strong>«Legg til på startskjermen»</strong>.</>
              )}
            </p>
          )}
        </div>
      </div>
      <button onClick={() => setShow(false)} className="bg-black/20 hover:bg-black/30 p-1.5 rounded-full transition-colors ml-2">
        <X size={16} />
      </button>
    </div>
  );
};
