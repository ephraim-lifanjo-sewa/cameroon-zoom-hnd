'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Production-safe Firebase error listener.
 * Prevents app crashes and logs permission errors instead.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.warn('Firestore permission error:', error);
      setError(error);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // DO NOT crash app in production
  useEffect(() => {
    if (!error) return;

    // optional: send to analytics
    // console.error already logged above

  }, [error]);

  return null;
}