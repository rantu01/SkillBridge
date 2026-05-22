import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Service from '@/app/(backend)/models/Service';
import { getServiceRatingMap } from '@/app/(backend)/lib/reviews';

// GET /api/services/me - Fetch services belonging to the logged-in user
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json({ error: 'User UID is required' }, { status: 400 });
        }

        const services = await Service.find({ ownerID: uid }).sort({ createdAt: -1 }).lean();
        const ratingMap = await getServiceRatingMap(services.map((service) => service._id));

        const servicesWithRatings = services.map((service) => ({
            ...service,
            _id: service._id?.toString?.() || service._id,
            ratingSummary: ratingMap[service._id?.toString?.() || service._id] || { averageRating: 0, reviewCount: 0 }
        }));

        return NextResponse.json({ success: true, services: servicesWithRatings }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user services:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
