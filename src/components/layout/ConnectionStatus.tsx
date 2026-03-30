/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';

/**
 * SILENT CONNECTION MONITOR
 * Monitors connectivity in the background for offline-first logic.
 * Visible UI removed as per request to keep the header clean.
 */
export function ConnectionStatus() {
  const [status, setStatus] = useState<'online' | 'weak' | 'offline'>('online');

  useEffect(() => {
    const checkStatus = () => {
      if (!navigator.onLine) {
        setStatus('offline');
      } else {
        const connection = (navigator as any).connection;
        if (connection && (connection.effectiveType === '2g' || connection.saveData)) {
          setStatus('weak');
        } else {
          setStatus('online');
        }
      }
    };

    window.addEventListener('online', checkStatus);
    window.addEventListener('offline', checkStatus);
    checkStatus();

    return () => {
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
    };
  }, []);

  // BACKGROUND ONLY: No visible UI in the header
  return null;
}
