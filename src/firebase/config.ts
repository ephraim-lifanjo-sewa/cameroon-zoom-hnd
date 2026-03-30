import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


export const firebaseConfig = {
  apiKey: "AIzaSyDkwPHmSXjmG_vFnzo9Z9MdItj7-Q7AutQ",
  authDomain: "studio-393888538-a5006.firebaseapp.com",
  projectId: "studio-393888538-a5006",
  storageBucket: "studio-393888538-a5006.firebasestorage.app",
  messagingSenderId: "89005373843",
  appId: "1:89005373843:web:58d4fcd327c0536aa25066"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);