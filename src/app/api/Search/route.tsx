
import { NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

/**
 * HIGH-PERFORMANCE NATURAL SEARCH SUGGESTIONS
 * Implements high-speed fuzzy matching for instantaneous UX.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';

    if (q.length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    const snapshot = await getDocs(query(collection(db, 'businesses'), limit(200)));
    const entries = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: data.businessName || data.name || "",
        category: data.category || "",
        city: data.city || ""
      };
    });
    
    // Fuzzy matching logic: checks if the query is contained anywhere in name, category, or city
    const suggestions = Array.from(new Set(
      entries
        .filter(item => 
          item.name.toLowerCase().includes(q) || 
          item.category.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q)
        )
        .map(item => item.name)
    )).slice(0, 6);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("API Search error", error);
    return NextResponse.json({ suggestions: [] });
  }
}
