
import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Simple status check for the API layer.
 */
export async function GET() {
  return NextResponse.json({
    status: "operational",
    service: "Cameroon Zoom API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  }, { status: 200 });
}
