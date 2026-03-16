import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';
import StudentVerification from '@/app/(backend)/models/StudentVerification';

export async function GET() {
  try {
    await dbConnect();

    // Get all verification documents
    const verifications = await StudentVerification.find().sort({ createdAt: -1 });

    // Get the corresponding users
    const uids = verifications.map(v => v.uid);
    const usersData = await FirebaseUser.find({ uid: { $in: uids }, isVerified: false });

    // Combine the data, ensuring we only return users who are actually found and unverified
    const users = verifications
      .map(verification => {
        const user = usersData.find(u => u.uid === verification.uid);
        if (!user) return null;
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: verification.createdAt, // Use verification submission date
          documentUrl: verification.documentUrl,
        };
      })
      .filter(u => u !== null);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}