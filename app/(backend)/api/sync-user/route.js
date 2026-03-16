import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { uid, email, displayName, isVerified } = body;

    console.log('[SyncUser] Incoming Payload:', JSON.stringify(body, null, 2));

    if (!uid || !email) {
      console.error('[SyncUser] Missing uid or email');
      return NextResponse.json({ error: 'UID and email are required' }, { status: 400 });
    }

    let user = await FirebaseUser.findOne({ uid });

    if (user) {
      console.log(`[SyncUser] User found in DB. Current displayName: "${user.displayName}", photoURL: "${user.photoURL}"`);
      user.email = email;
      // We do NOT overwrite displayName, photoURL, or isVerified from the sync-user payload.
      // isVerified is controlled by the admin approval process.
      await user.save();
      console.log(`[SyncUser] User updated (email/status).`);
    } else {
      console.log(`[SyncUser] User not found, creating new entry.`);
      user = await FirebaseUser.create({
        uid,
        email,
        displayName: displayName || '',
        photoURL: '',
        isVerified: isVerified || false
      });
    }

    const plainUser = user.toObject();
    console.log(`[SyncUser] Returning User:`, JSON.stringify(plainUser, null, 2));
    return NextResponse.json({ success: true, user: plainUser }, { status: 200 });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}