import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Booking from '@/app/(backend)/models/Booking';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userID = searchParams.get('userID'); // requester
        const providerID = searchParams.get('providerID');
        const serviceID = searchParams.get('serviceID');

        let query = {};
        if (userID) query.requesterID = userID;
        if (providerID) query.providerID = providerID;
        if (serviceID) query.serviceID = serviceID;

        let bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();

        // Normalize fields for the client
        bookings = bookings.map(b => ({
            ...b,
            _id: b._id?.toString?.() || b._id,
            timeSlot: b.timeSlot ? new Date(b.timeSlot).toISOString() : null
        }));

        // Populate minimal user/service info
        const FirebaseUser = (await import('@/app/(backend)/models/FirebaseUser')).default;
        const Service = (await import('@/app/(backend)/models/Service')).default;

        const userIDs = [...new Set(bookings.flatMap(b => [b.requesterID, b.providerID]))];
        const users = await FirebaseUser.find({ uid: { $in: userIDs } }).select('uid displayName photoURL').lean();
        const userMap = users.reduce((acc, u) => { acc[u.uid] = u; return acc; }, {});

        const serviceIDs = [...new Set(bookings.map(b => b.serviceID))];
        const services = await Service.find({ _id: { $in: serviceIDs } }).lean();
        const serviceMap = services.reduce((acc, s) => { acc[s._id] = s; return acc; }, {});

        const enriched = bookings.map(b => ({
            ...b,
            requester: userMap[b.requesterID] || null,
            provider: userMap[b.providerID] || null,
            service: serviceMap[b.serviceID] || null
        }));

        return NextResponse.json({ success: true, bookings: enriched }, { status: 200 });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { serviceID, requesterID, providerID, timeSlot } = body;

        if (!serviceID || !requesterID || !providerID || !timeSlot) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newBooking = await Booking.create({
            serviceID,
            requesterID,
            providerID,
            timeSlot: new Date(timeSlot),
            status: 'Pending'
        });

        const bookingOut = { ...newBooking.toObject(), _id: newBooking._id.toString(), timeSlot: newBooking.timeSlot.toISOString() };
        return NextResponse.json({ success: true, booking: bookingOut }, { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
