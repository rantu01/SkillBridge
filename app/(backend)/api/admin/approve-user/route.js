import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';
import StudentVerification from '@/app/(backend)/models/StudentVerification';

export async function POST(request) {
  try {
    await dbConnect();

    const { uid, action } = await request.json(); // action: 'approve' or 'reject' or 'delete'

    if (!uid || !action) {
      return NextResponse.json({ error: 'UID and action are required' }, { status: 400 });
    }

    if (action === 'approve') {
      console.log(`[ApproveUser] Approving user: ${uid}`);
      // 1. Update FirebaseUser status
      let user = await FirebaseUser.findOne({ uid });
      if (user) {
        user.isVerified = true;
        await user.save();
        console.log(`[ApproveUser] FirebaseUser ${uid} marked as verified.`);
      } else {
        console.error(`[ApproveUser] FirebaseUser ${uid} not found!`);
      }

      // 2. Delete the record from StudentVerification as it's no longer 'pending'
      await StudentVerification.findOneAndDelete({ uid });
      console.log(`[ApproveUser] User ${uid} verified and verification record deleted.`);

    } else if (action === 'reject') {
      console.log(`[ApproveUser] Rejecting user: ${uid}`);
      // Update StudentVerification to rejected
      await StudentVerification.findOneAndUpdate(
        { uid },
        { status: 'rejected' },
        { new: true }
      );
    } else if (action === 'delete') {
      console.log(`[ApproveUser] Deleting verification application for: ${uid}`);
      // Delete the student verification request altogether from DB
      await StudentVerification.findOneAndDelete({ uid });

      // Also ensure FirebaseUser isVerified is false
      await FirebaseUser.findOneAndUpdate(
        { uid },
        { isVerified: false }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating user verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
