import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Booking from '@/app/(backend)/models/Booking';

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

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { action, actorID, rejectionReason } = body;

        if (!action) {
            return NextResponse.json({ error: 'action is required' }, { status: 400 });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (action === 'approve') {
            if (booking.status !== 'Pending') {
                return NextResponse.json({ error: 'Only pending bookings can be approved' }, { status: 400 });
            }

            booking.status = 'Approved';
            booking.reviewedBy = actorID || null;
            booking.reviewedAt = new Date();
            appendEvent(booking, 'admin_approved', actorID || null, 'Booking approved by admin');
        } else if (action === 'reject') {
            if (booking.status !== 'Pending') {
                return NextResponse.json({ error: 'Only pending bookings can be rejected' }, { status: 400 });
            }

            booking.status = 'Rejected';
            booking.reviewedBy = actorID || null;
            booking.reviewedAt = new Date();
            booking.rejectionReason = rejectionReason || 'Rejected by admin';
            appendEvent(booking, 'admin_rejected', actorID || null, 'Booking rejected by admin', {
                rejectionReason: booking.rejectionReason
            });
        } else {
            return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
        }

        await booking.save();

        const bookingOut = {
            ...booking.toObject(),
            _id: booking._id.toString(),
            timeSlot: booking.timeSlot ? new Date(booking.timeSlot).toISOString() : null
        };

        return NextResponse.json({ success: true, booking: bookingOut }, { status: 200 });
    } catch (error) {
        console.error('Error updating admin booking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}