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
        const { uid, isVerified, displayName, creditsDelta, creditsNote, actorID } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: 'UID is required' }, { status: 400 });
        }

        const user = await FirebaseUser.findOne({ uid });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (isVerified !== undefined) user.isVerified = isVerified;
        if (displayName !== undefined) user.displayName = displayName;

        if (creditsDelta !== undefined && creditsDelta !== null && creditsDelta !== '') {
            const parsedDelta = Number(creditsDelta);
            if (Number.isNaN(parsedDelta) || parsedDelta === 0) {
                return NextResponse.json({ error: 'creditsDelta must be a non-zero number' }, { status: 400 });
            }

            const balanceBefore = Number(user.credits || 0);
            const balanceAfter = balanceBefore + parsedDelta;
            if (balanceAfter < 0) {
                return NextResponse.json({ error: 'Credit adjustment would create a negative balance' }, { status: 400 });
            }

            user.credits = balanceAfter;
            user.creditTransactions = user.creditTransactions || [];
            user.creditTransactions.unshift({
                type: 'manual_adjustment',
                bookingID: null,
                serviceID: null,
                actorID: actorID || null,
                delta: parsedDelta,
                balanceBefore,
                balanceAfter,
                title: 'Manual credit adjustment',
                note: creditsNote || '',
                createdAt: new Date()
            });
        }

        await user.save();

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
