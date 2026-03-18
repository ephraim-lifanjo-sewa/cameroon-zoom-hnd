'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  Firestore,
  getFirestore
} from 'firebase/firestore';

let app: FirebaseApp;
let firestore: Firestore;

/**
 * Initializes Firebase and Firestore with offline persistence.
 * Safe for multiple calls across different components or re-renders.
 */
export function initializeFirebase() {
  const apps = getApps();
  if (apps.length > 0) {
    app = apps[0];
  } else {
    try {
      // Attempt to initialize with the provided config object
      app = initializeApp(firebaseConfig);
    } catch (e) {
      // Fallback to environment-based initialization if available
      app = initializeApp();
    }
  }

  return getSdks(app);
}

/**
 * Retrieves SDK instances. 
 * Safely handles Firestore initialization to avoid "already called" errors.
 */
export function getSdks(firebaseApp: FirebaseApp, existingDb?: Firestore) {
  let db: Firestore;
  
  if (existingDb) {
    db = existingDb;
  } else {
    try {
      // Try initializing with persistence options (this can only happen once)
      db = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch (e) {
      // If already initialized (e.g. by another component or during HMR), 
      // retrieve the existing instance instead of throwing.
      db = getFirestore(firebaseApp);
    }
  }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: db
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
