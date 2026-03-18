
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/**
 * GET /api/reviews
 * Fetch verified feedback entries.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const pageSize = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    let q = query(collection(db, 'reviews'), orderBy('date', 'desc'), limit(pageSize));

    if (businessId) {
      q = query(q, where('businessId', '==', businessId));
    }

    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      count: reviews.length,
      data: reviews
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch reviews", message: error.message }, { status: 500 });
  }
}
