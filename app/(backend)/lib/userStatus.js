import dbConnect from '@/app/(backend)/lib/mongodb';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';

export async function checkUserStatus(uid) {
    if (!uid) return { allowed: false, error: 'User ID is required', status: 401 };

    try {
        await dbConnect();
        const user = await FirebaseUser.findOne({ uid }).select('status statusReason suspendedUntil').lean();

        if (!user) return { allowed: false, error: 'User not found', status: 404 };

        const accountStatus = user.status || 'active';

        if (accountStatus === 'blocked') {
            const reason = user.statusReason || 'Your account has been blocked. Please contact support.';
            return { allowed: false, error: reason, status: 403 };
        }

        if (accountStatus === 'suspended') {
            if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
                const untilDate = new Date(user.suspendedUntil).toLocaleDateString();
                const reason = user.statusReason
                    ? `Your account is suspended until ${untilDate}. Reason: ${user.statusReason}`
                    : `Your account is suspended until ${untilDate}. Please contact support.`;
                return { allowed: false, error: reason, status: 403 };
            }
            // Suspension period expired - auto-activate
            await FirebaseUser.updateOne({ uid }, { $set: { status: 'active', statusReason: '', suspendedUntil: null, blockedBy: null, blockedAt: null } });
        }

        return { allowed: true, user };
    } catch (error) {
        console.error('[checkUserStatus] Error:', error);
        return { allowed: false, error: 'Internal server error', status: 500 };
    }
}

export async function requireActiveUser(uid) {
    const result = await checkUserStatus(uid);
    if (!result.allowed) {
        const { NextResponse } = await import('next/server');
        return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return null;
}
