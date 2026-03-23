
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/**
 * GET /api/categories
 * Fetch all enterprise categories and sectors.
 */
export async function GET() {
  try {
    const snapshot = await getDocs(query(collection(db, 'categories'), orderBy('name', 'asc')));
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      count: categories.length,
      data: categories
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch categories", message: error.message }, { status: 500 });
  }
}
