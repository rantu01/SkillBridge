import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';

// GET all users
export async function GET() {
    try {
        await dbConnect();
        const users = await FirebaseUser.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, users }, { status: 200 });
    } catch (error) {
        console.error('[AdminUsers GET] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH update user (e.g., toggle verification)
export async function PATCH(request) {
    try {
        await dbConnect();
        const { uid, isVerified, displayName } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: 'UID is required' }, { status: 400 });
        }

        const updateData = {};
        if (isVerified !== undefined) updateData.isVerified = isVerified;
        if (displayName !== undefined) updateData.displayName = displayName;

        const user = await FirebaseUser.findOneAndUpdate(
            { uid },
            { $set: updateData },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error) {
        console.error('[AdminUsers PATCH] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE user
export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json({ error: 'UID is required' }, { status: 400 });
        }

        const user = await FirebaseUser.findOneAndDelete({ uid });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('[AdminUsers DELETE] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
