import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Booking from '@/app/(backend)/models/Booking';

const AUTO_APPROVE_BOOKINGS = process.env.AUTO_APPROVE_BOOKINGS === 'true';

const normalizeTimeSlot = (timeSlot) => {
    const parsed = new Date(timeSlot);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const appendEvent = (booking, type, actorID = null, message = '', meta = {}) => {
    booking.events = booking.events || [];
    booking.events.push({
        type,
        actorID,
        message,
        meta,
        createdAt: new Date()
    });
};

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userID = searchParams.get('userID'); // requester
        const providerID = searchParams.get('providerID');
        const serviceID = searchParams.get('serviceID');
        const status = searchParams.get('status');

        // Build query: support requester OR provider when both params provided
        let query = {};
        const baseFilters = [];
        if (serviceID) baseFilters.push({ serviceID });

        if (userID && providerID) {
            // user wants bookings where they are requester OR provider
            const orClause = { $or: [{ requesterID: userID }, { providerID: providerID }] };
            if (baseFilters.length) query = { $and: [...baseFilters, orClause] };
            else query = orClause;
        } else {
            if (userID) query.requesterID = userID;
            if (providerID) query.providerID = providerID;
            if (serviceID) query.serviceID = serviceID;
        }
        if (status && status !== 'all') query.status = status;

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

        if (requesterID === providerID) {
            return NextResponse.json({ error: 'You cannot book your own service' }, { status: 400 });
        }

        const normalizedTimeSlot = normalizeTimeSlot(timeSlot);
        if (!normalizedTimeSlot) {
            return NextResponse.json({ error: 'Invalid booking time' }, { status: 400 });
        }

        if (normalizedTimeSlot.getTime() <= Date.now()) {
            return NextResponse.json({ error: 'Booking time must be in the future' }, { status: 400 });
        }

        const sameSlot = normalizedTimeSlot.toISOString();
        const duplicateBooking = await Booking.findOne({
            requesterID,
            serviceID,
            timeSlot: normalizedTimeSlot,
            status: { $in: ['Pending', 'Approved', 'In Progress'] }
        }).lean();

        if (duplicateBooking) {
            return NextResponse.json({ error: 'You already requested this service for the selected time' }, { status: 409 });
        }

        const providerConflict = await Booking.findOne({
            providerID,
            timeSlot: normalizedTimeSlot,
            status: { $in: ['Pending', 'Approved', 'In Progress'] }
        }).lean();

        if (providerConflict) {
            return NextResponse.json({ error: 'Provider already has a booking at this time' }, { status: 409 });
        }

        const newBooking = await Booking.create({
            serviceID,
            requesterID,
            providerID,
            timeSlot: normalizedTimeSlot,
            status: AUTO_APPROVE_BOOKINGS ? 'Approved' : 'Pending',
            autoApproved: AUTO_APPROVE_BOOKINGS,
            reviewedAt: AUTO_APPROVE_BOOKINGS ? new Date() : null,
            events: []
        });

        appendEvent(
            newBooking,
            AUTO_APPROVE_BOOKINGS ? 'auto_approved' : 'created',
            requesterID,
            AUTO_APPROVE_BOOKINGS ? 'Booking auto-approved by system' : 'Booking request created',
            { serviceID, requesterID, providerID, timeSlot: sameSlot }
        );

        await newBooking.save();

        const bookingOut = { ...newBooking.toObject(), _id: newBooking._id.toString(), timeSlot: newBooking.timeSlot.toISOString() };
        return NextResponse.json({ success: true, booking: bookingOut }, { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
