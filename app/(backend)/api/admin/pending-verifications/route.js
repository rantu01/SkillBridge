import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';
import StudentVerification from '@/app/(backend)/models/StudentVerification';

const ADMIN_EMAILS = ['admin@admin.com'];

export async function GET(request) {
  try {
    const adminEmail = request.headers.get('x-admin-email');
    if (!adminEmail || !ADMIN_EMAILS.map(e => e.toLowerCase()).includes(adminEmail.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
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