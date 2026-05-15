import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Booking from '@/app/(backend)/models/Booking';

const enrichBookings = async (bookings) => {
    const FirebaseUser = (await import('@/app/(backend)/models/FirebaseUser')).default;
    const Service = (await import('@/app/(backend)/models/Service')).default;

    const userIDs = [...new Set(bookings.flatMap((b) => [b.requesterID, b.providerID]))];
    const users = await FirebaseUser.find({ uid: { $in: userIDs } }).select('uid displayName photoURL email').lean();
    const userMap = users.reduce((acc, user) => {
        acc[user.uid] = user;
        return acc;
    }, {});

    const serviceIDs = [...new Set(bookings.map((b) => b.serviceID))];
    const services = await Service.find({ _id: { $in: serviceIDs } }).lean();
    const serviceMap = services.reduce((acc, service) => {
        acc[service._id.toString()] = service;
        return acc;
    }, {});

    return bookings.map((booking) => ({
        ...booking,
        requester: userMap[booking.requesterID] || null,
        provider: userMap[booking.providerID] || null,
        service: serviceMap[booking.serviceID] || null
    }));
};

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        let bookings = await Booking.find(query).sort({ createdAt: -1 }).lean();
        bookings = bookings.map((booking) => ({
            ...booking,
            _id: booking._id?.toString?.() || booking._id,
            timeSlot: booking.timeSlot ? new Date(booking.timeSlot).toISOString() : null
        }));

        const enriched = await enrichBookings(bookings);
        const summary = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const summaryMap = summary.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            bookings: enriched,
            summary: {
                all: bookings.length,
                pending: summaryMap.Pending || 0,
                approved: summaryMap.Approved || 0,
                inProgress: summaryMap['In Progress'] || 0,
                completed: summaryMap.Completed || 0,
                rejected: summaryMap.Rejected || 0
            }
        });
    } catch (error) {
        console.error('Error fetching admin bookings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}