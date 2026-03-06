import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import StudentVerification from '@/app/(backend)/models/StudentVerification';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    const verification = await StudentVerification.findOne({ uid }).sort({ createdAt: -1 });

    if (!verification) {
      return NextResponse.json({ hasDocument: false }, { status: 200 });
    }

    return NextResponse.json({
      hasDocument: true,
      documentUrl: verification.documentUrl,
      status: verification.status,
      uploadedAt: verification.createdAt
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}