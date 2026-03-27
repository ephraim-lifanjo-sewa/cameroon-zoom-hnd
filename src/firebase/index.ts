'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  UserCredential,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

import { useEffect, useState } from 'react';

let app: FirebaseApp;
let firestore: Firestore;

/* -------------------- INIT -------------------- */

export function initializeFirebase() {
  const apps = getApps();

  if (apps.length > 0) {
    app = apps[0];
  } else {
    try {
      app = initializeApp(firebaseConfig);
    } catch {
      app = initializeApp();
    }
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
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      db = getFirestore(firebaseApp);
    }
  }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: db,
  };
}

/* -------------------- HOOKS -------------------- */

export function useAuth() {
  const { auth } = initializeFirebase();
  return auth;
}

export function useFirestore() {
  const { firestore } = initializeFirebase();
  return firestore;
}

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(!auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, [auth]);

  return { user, loading };
}

/* -------------------- SIGN UP -------------------- */

export async function initiateEmailSignUp(
  email: string,
  password: string,
  data?: {
    name?: string;
    photoURL?: string;
  }
): Promise<UserCredential> {
  const { auth, firestore } = initializeFirebase();

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  if (data?.name || data?.photoURL) {
    await updateProfile(cred.user, {
      displayName: data?.name,
      photoURL: data?.photoURL,
    });
  }

  await setDoc(doc(firestore, 'users', cred.user.uid), {
    email: cred.user.email,
    name: data?.name || '',
    photoURL: data?.photoURL || '',
    createdAt: serverTimestamp(),
  });

  return cred;
}

/* -------------------- SIGN IN -------------------- */

export async function initiateEmailSignIn(
  email: string,
  password: string
): Promise<UserCredential> {
  const { auth } = initializeFirebase();
  return signInWithEmailAndPassword(auth, email, password);
}

/* -------------------- LOGOUT -------------------- */

export async function logout() {
  const { auth } = initializeFirebase();
  return signOut(auth);
}

/* -------------------- EXPORTS -------------------- */

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';