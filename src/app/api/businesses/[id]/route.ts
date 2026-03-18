
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/**
 * GET /api/businesses/[id]
 * Fetch detailed data for a specific enterprise.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docRef = doc(db, 'businesses', id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Enterprise not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: snapshot.id,
      ...snapshot.data()
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch enterprise details", message: error.message }, { status: 500 });
  }
}
