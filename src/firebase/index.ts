'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential,
  User,
  onAuthStateChanged
} from 'firebase/auth';

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  getFirestore
} from 'firebase/firestore';

import { useEffect, useState } from 'react';

let app: FirebaseApp;
let firestore: Firestore;

/* ===========================
   INIT FIREBASE
=========================== */

export function initializeFirebase() {
  const apps = getApps();

  if (apps.length > 0) {
    app = apps[0];
  } else {
    app = initializeApp(firebaseConfig);
  }

  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp, existingDb?: Firestore) {
  let db: Firestore;

  if (existingDb) {
    db = existingDb;
  } else {
    try {
      db = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch {
      db = getFirestore(firebaseApp);
    }
  }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: db
  };
}

const { auth, firestore: db } = initializeFirebase();

export { auth, db };



/* ===========================
   AUTH FUNCTIONS
=========================== */

export async function initiateEmailSignUp(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName && cred.user) {
    await updateProfile(cred.user, {
      displayName
    });
  }

  return cred;
}



export async function initiateEmailLogin(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}


/* alias for login page */
export const initiateEmailSignIn = initiateEmailLogin;



export async function logoutUser() {
  return signOut(auth);
}



/* ===========================
   USER HOOK
=========================== */

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  return { user, loading };
}



/* ===========================
   AUTH HOOK
=========================== */

export function useAuth() {
  const { user, loading } = useUser();

  return {
    user,
    loading,
    login: initiateEmailLogin,
    signin: initiateEmailSignIn,
    signup: initiateEmailSignUp,
    logout: logoutUser
  };
}



/* ===========================
   FIRESTORE
=========================== */

export function useFirestore() {
  return db;
}



/* ===========================
   EXPORT OTHER FILES
=========================== */

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';