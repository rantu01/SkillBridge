import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Service from '@/app/(backend)/models/Service';

// GET /api/services/me - Fetch services belonging to the logged-in user
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json({ error: 'User UID is required' }, { status: 400 });
        }

        const services = await Service.find({ ownerID: uid }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, services }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user services:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
