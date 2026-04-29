import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Booking from '@/app/(backend)/models/Booking';

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

        booking.status = newStatus;
        if (meetLink) {
            booking.meetLink = meetLink;
        }
        await booking.save();

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
        const bookingOut = { ...booking, _id: booking._id?.toString?.(), timeSlot: booking.timeSlot ? new Date(booking.timeSlot).toISOString() : null };
        return NextResponse.json({ success: true, booking: bookingOut }, { status: 200 });
    } catch (err) {
        console.error('Error GET booking by id:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
