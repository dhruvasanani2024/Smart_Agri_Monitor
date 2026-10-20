import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

// GET /api/farms/[email] → get all saved farms for a user
export async function GET(request, { params }) {
  try {
    const { email } = await params;
    const decodedEmail = decodeURIComponent(email);

    let client;
    try {
      client = await clientPromise;
    } catch {
      // MongoDB not connected or placeholder password in .env: return empty list without server error
      return NextResponse.json({
        status: 'warning',
        farms: [],
        message: 'Database not connected yet. Add your MongoDB password to .env to enable saving.',
      });
    }

    const db = client.db('smart_agri');
    const farms = await db
      .collection('farms')
      .find({ userEmail: decodedEmail })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ status: 'success', farms });
  } catch (err) {
    console.error('GET /api/farms error:', err);
    return NextResponse.json(
      { status: 'error', detail: err.message },
      { status: 500 }
    );
  }
}
