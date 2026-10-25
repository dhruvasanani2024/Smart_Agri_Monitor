import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // ── Validation ─────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return NextResponse.json(
        { status: 'error', detail: 'name, email and password are required.' },
        { status: 400 }
      );
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { status: 'error', detail: 'Invalid email address.' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { status: 'error', detail: 'Password must be at least 6 characters.' },
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
    const users = db.collection('users');

    // ── Duplicate check ─────────────────────────────────────────────────
    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { status: 'error', detail: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // ── Hash password & insert ──────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();
    const result = await users.insertOne({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        status: 'success',
        user: { id: result.insertedId, name: name.trim(), email: email.toLowerCase() },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('POST /api/auth/signup error:', err);
    return NextResponse.json(
      { status: 'error', detail: 'Internal server error.' },
      { status: 500 }
    );
  }
}
