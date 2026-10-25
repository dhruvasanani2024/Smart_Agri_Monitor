import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // ── Validation ─────────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { status: 'error', detail: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // ── DB connection ───────────────────────────────────────────────────
    let client;
    try {
      client = await clientPromise;
    } catch {
      return NextResponse.json(
        { status: 'error', detail: 'Database not connected. Check your MONGODB_URI in .env.' },
        { status: 503 }
      );
    }

    const db = client.db('smart_agri');
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    // ── User not found ──────────────────────────────────────────────────
    if (!user) {
      // Return same message as wrong password to prevent email enumeration
      return NextResponse.json(
        { status: 'error', detail: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // ── Password verification ───────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { status: 'error', detail: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // ── Success — return safe user object (no hash) ─────────────────────
    return NextResponse.json({
      status: 'success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('POST /api/auth/login error:', err);
    return NextResponse.json(
      { status: 'error', detail: 'Internal server error.' },
      { status: 500 }
    );
  }
}
