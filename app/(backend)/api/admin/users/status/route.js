import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';

const ADMIN_EMAILS = ['admin@admin.com'];

export async function PATCH(request) {
    try {
        const adminEmail = request.headers.get('x-admin-email');
        if (!adminEmail || !ADMIN_EMAILS.map(e => e.toLowerCase()).includes(adminEmail.toLowerCase())) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }
        await dbConnect();
        const { uid, status, reason, suspendedUntil, actorID } = await request.json();

        if (!uid || !status) {
            return NextResponse.json({ error: 'UID and status are required' }, { status: 400 });
        }

        if (!['active', 'blocked', 'suspended'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status. Must be active, blocked, or suspended' }, { status: 400 });
        }

        const user = await FirebaseUser.findOne({ uid });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        user.status = status;
        user.statusReason = reason || '';

        if (status === 'blocked') {
            user.blockedBy = actorID || null;
            user.blockedAt = new Date();
            user.suspendedUntil = null;
        } else if (status === 'suspended') {
            user.suspendedUntil = suspendedUntil ? new Date(suspendedUntil) : null;
            user.blockedBy = actorID || null;
            user.blockedAt = new Date();
        } else {
            user.blockedBy = null;
            user.blockedAt = null;
            user.suspendedUntil = null;
        }

        await user.save();

        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error) {
        console.error('[AdminUserStatus PATCH] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
