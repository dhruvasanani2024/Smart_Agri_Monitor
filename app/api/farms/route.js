import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

// POST /api/farms → save a new farm boundary
export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail, farmName, coordinates } = body;

    if (!userEmail || !farmName || !coordinates) {
      return NextResponse.json(
        { status: 'error', detail: 'Missing userEmail, farmName, or coordinates' },
        { status: 400 }
      );
    }

    let client;
    try {
      client = await clientPromise;
    } catch {
      return NextResponse.json(
        {
          status: 'error',
          detail: 'Database not connected. Please replace <db_password> in your .env file with your actual MongoDB Atlas password.',
        },
        { status: 503 }
      );
    }

    const db = client.db('smart_agri');

    const doc = {
      userEmail,
      farmName,
      coordinates,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('farms').insertOne(doc);

    return NextResponse.json({
      status: 'success',
      farm: { ...doc, _id: result.insertedId },
    });
  } catch (err) {
    console.error('POST /api/farms error:', err);
    return NextResponse.json(
      { status: 'error', detail: err.message },
      { status: 500 }
    );
  }
}

// DELETE /api/farms → delete a saved farm
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { status: 'error', detail: 'Missing id parameter' },
        { status: 400 }
      );
    }

    let client;
    try {
      client = await clientPromise;
    } catch {
      return NextResponse.json(
        { status: 'error', detail: 'Database not connected.' },
        { status: 503 }
      );
    }

    const { ObjectId } = await import('mongodb');
    const db = client.db('smart_agri');

    await db.collection('farms').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ status: 'success' });
  } catch (err) {
    console.error('DELETE /api/farms error:', err);
    return NextResponse.json(
      { status: 'error', detail: err.message },
      { status: 500 }
    );
  }
}
