'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2',
        'bg-amber-500 py-2 px-4 text-sm font-medium text-white',
        'transition-transform duration-300',
        isOffline ? 'translate-y-0' : '-translate-y-full',
      ].join(' ')}
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>You&apos;re offline — some features may be unavailable</span>
    </div>
  );
}
