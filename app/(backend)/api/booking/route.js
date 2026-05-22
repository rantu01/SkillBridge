import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Booking from '@/app/(backend)/models/Booking';
import Service from '@/app/(backend)/models/Service';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';
import { applyCreditDelta, createCreditTransaction, CREDIT_TRANSACTION_TYPES } from '@/app/(backend)/lib/credits';
import { getBookingReviewMap } from '@/app/(backend)/lib/reviews';

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

        const reviewMap = await getBookingReviewMap(bookings.map((booking) => booking._id));

        const enriched = bookings.map(b => ({
            ...b,
            requester: userMap[b.requesterID] || null,
            provider: userMap[b.providerID] || null,
            service: serviceMap[b.serviceID] || null,
            review: reviewMap[b._id] || null,
            creditSummary: {
                servicePrice: Number(serviceMap[b.serviceID]?.price || 0),
                requesterDelta: ['Approved', 'In Progress', 'Completed'].includes(b.status) ? -Number(serviceMap[b.serviceID]?.price || 0) : 0,
                providerDelta: b.status === 'Completed' ? Number(serviceMap[b.serviceID]?.price || 0) : 0,
                settlement: b.status === 'Completed' ? 'completed' : b.status === 'Approved' ? 'reserved' : 'pending'
            }
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

        const service = await Service.findById(serviceID).lean();
        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        const requester = await FirebaseUser.findOne({ uid: requesterID });
        if (!requester) {
            return NextResponse.json({ error: 'Requester not found' }, { status: 404 });
        }

        const servicePrice = Number(service.price || 0);
        const requesterCredits = Number(requester.credits || 0);
        if (requesterCredits < servicePrice) {
            return NextResponse.json({
                error: 'Insufficient credits to request this booking',
                requiredCredits: servicePrice,
                currentCredits: requesterCredits
            }, { status: 400 });
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
            events: [],
            creditEvents: []
        });

        appendEvent(
            newBooking,
            AUTO_APPROVE_BOOKINGS ? 'auto_approved' : 'created',
            requesterID,
            AUTO_APPROVE_BOOKINGS ? 'Booking auto-approved by system' : 'Booking request created',
            { serviceID, requesterID, providerID, timeSlot: sameSlot }
        );

        if (AUTO_APPROVE_BOOKINGS) {
            const requesterDebit = applyCreditDelta(
                requester,
                -servicePrice,
                createCreditTransaction({
                    type: CREDIT_TRANSACTION_TYPES.BOOKING_DEBIT,
                    bookingID: newBooking._id.toString(),
                    serviceID,
                    actorID: requesterID,
                    delta: -servicePrice,
                    balanceBefore: requesterCredits,
                    balanceAfter: requesterCredits - servicePrice,
                    title: `Booking approved: ${service.title}`,
                    note: 'Credits reserved automatically on booking approval'
                })
            );

            if (!requesterDebit.success) {
                await Booking.findByIdAndDelete(newBooking._id);
                return NextResponse.json({
                    error: requesterDebit.error,
                    requiredCredits: servicePrice,
                    currentCredits: requesterCredits
                }, { status: 400 });
            }

            newBooking.creditEvents = newBooking.creditEvents || [];
            newBooking.creditEvents.unshift(createCreditTransaction({
                type: CREDIT_TRANSACTION_TYPES.BOOKING_DEBIT,
                bookingID: newBooking._id.toString(),
                serviceID,
                actorID: requesterID,
                delta: -servicePrice,
                balanceBefore: requesterDebit.balanceBefore,
                balanceAfter: requesterDebit.balanceAfter,
                title: `Booking approved: ${service.title}`,
                note: 'Credits reserved automatically on booking approval'
            }));
        }

        try {
            await requester.save();
            await newBooking.save();
        } catch (saveError) {
            if (AUTO_APPROVE_BOOKINGS) {
                requester.credits = requesterCredits;
                requester.creditTransactions = (requester.creditTransactions || []).filter((transaction) => transaction.bookingID !== newBooking._id.toString());
                await requester.save();
            }
            await Booking.findByIdAndDelete(newBooking._id);
            throw saveError;
        }

        const bookingOut = { ...newBooking.toObject(), _id: newBooking._id.toString(), timeSlot: newBooking.timeSlot.toISOString() };
        return NextResponse.json({ success: true, booking: bookingOut }, { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
