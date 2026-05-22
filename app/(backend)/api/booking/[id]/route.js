import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Booking from '@/app/(backend)/models/Booking';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';
import Service from '@/app/(backend)/models/Service';
import { applyCreditDelta, createCreditTransaction, CREDIT_TRANSACTION_TYPES } from '@/app/(backend)/lib/credits';
import { getBookingReviewMap } from '@/app/(backend)/lib/reviews';

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

const allowedTransitions = {
    Pending: ['Approved'],
    Approved: ['In Progress'],
    'In Progress': ['Completed'],
    Completed: []
};

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        console.log(`[BookingPUT] received request for id=${id}`);
        const body = await request.json();
        const { newStatus, actorID, meetLink } = body;

        if (!newStatus) {
            return NextResponse.json({ error: 'newStatus is required' }, { status: 400 });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            console.error(`[BookingPUT] Booking not found for id=${id}`);
            return NextResponse.json({ error: 'Booking not found', id }, { status: 404 });
        }

        // Basic actor check: allow provider to approve/start/complete; requester cannot move forward (could add cancel later)
        if (actorID && actorID !== booking.providerID && actorID !== booking.requesterID) {
            return NextResponse.json({ error: 'Unauthorized actor' }, { status: 403 });
        }

        const current = booking.status;
        const allowed = allowedTransitions[current] || [];
        if (!allowed.includes(newStatus)) {
            return NextResponse.json({ error: `Invalid status transition from ${current} to ${newStatus}` }, { status: 400 });
        }

        const service = await Service.findById(booking.serviceID).lean();
        const servicePrice = Number(service?.price || 0);

        let providerCreditRollback = null;
        if (newStatus === 'Completed') {
            const provider = await FirebaseUser.findOne({ uid: booking.providerID });
            if (!provider) {
                return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
            }

            const providerCredits = Number(provider.credits || 0);
            const providerCreditResult = applyCreditDelta(
                provider,
                servicePrice,
                createCreditTransaction({
                    type: CREDIT_TRANSACTION_TYPES.BOOKING_CREDIT,
                    bookingID: booking._id.toString(),
                    serviceID: booking.serviceID,
                    actorID: actorID || booking.providerID,
                    delta: servicePrice,
                    balanceBefore: providerCredits,
                    balanceAfter: providerCredits + servicePrice,
                    title: `Booking completed: ${service?.title || 'Service'}`,
                    note: 'Credits earned after completion confirmation'
                })
            );

            if (!providerCreditResult.success) {
                return NextResponse.json({ error: providerCreditResult.error }, { status: 400 });
            }

            providerCreditRollback = async () => {
                provider.credits = providerCredits;
                provider.creditTransactions = (provider.creditTransactions || []).filter((tx) => tx.bookingID !== booking._id.toString() || tx.type !== CREDIT_TRANSACTION_TYPES.BOOKING_CREDIT);
                await provider.save();
            };

            await provider.save();
            booking.creditEvents = booking.creditEvents || [];
            booking.creditEvents.unshift(createCreditTransaction({
                type: CREDIT_TRANSACTION_TYPES.BOOKING_CREDIT,
                bookingID: booking._id.toString(),
                serviceID: booking.serviceID,
                actorID: actorID || booking.providerID,
                delta: servicePrice,
                balanceBefore: providerCreditResult.balanceBefore,
                balanceAfter: providerCreditResult.balanceAfter,
                title: `Booking completed: ${service?.title || 'Service'}`,
                note: 'Credits earned after completion confirmation'
            }));
        }

        booking.status = newStatus;
        if (meetLink) {
            booking.meetLink = meetLink;
        }

        appendEvent(booking, 'status_changed', actorID || null, `Status updated to ${newStatus}`, {
            newStatus,
            meetLink: Boolean(meetLink)
        });

        try {
            await booking.save();
        } catch (saveError) {
            if (providerCreditRollback) {
                await providerCreditRollback();
            }
            throw saveError;
        }

        const bookingOut = { ...booking.toObject(), _id: booking._id.toString(), timeSlot: booking.timeSlot ? new Date(booking.timeSlot).toISOString() : null };
        return NextResponse.json({ success: true, booking: bookingOut }, { status: 200 });
    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        console.log(`[BookingGET] lookup id=${id}`);
        const booking = await Booking.findById(id).lean();
        if (!booking) return NextResponse.json({ error: 'Booking not found', id }, { status: 404 });

        const [requester, provider, service] = await Promise.all([
            FirebaseUser.findOne({ uid: booking.requesterID }).select('uid displayName email photoURL').lean(),
            FirebaseUser.findOne({ uid: booking.providerID }).select('uid displayName email photoURL').lean(),
            Service.findById(booking.serviceID).lean()
        ]);

        const reviewMap = await getBookingReviewMap([booking._id]);
        const bookingOut = {
            ...booking,
            _id: booking._id?.toString?.(),
            timeSlot: booking.timeSlot ? new Date(booking.timeSlot).toISOString() : null,
            requester,
            provider,
            service,
            review: reviewMap[booking._id?.toString?.()] || null
        };
        return NextResponse.json({ success: true, booking: bookingOut }, { status: 200 });
    } catch (err) {
        console.error('Error GET booking by id:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
