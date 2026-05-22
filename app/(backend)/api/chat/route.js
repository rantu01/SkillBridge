import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Chat from '@/app/(backend)/models/Chat';
import Booking from '@/app/(backend)/models/Booking';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';
import Service from '@/app/(backend)/models/Service';

function normalizeBooking(booking) {
    return booking
        ? {
            ...booking,
            _id: booking._id?.toString?.() || booking._id,
            timeSlot: booking.timeSlot ? new Date(booking.timeSlot).toISOString() : null,
            createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : null,
            updatedAt: booking.updatedAt ? new Date(booking.updatedAt).toISOString() : null
        }
        : null;
}

function normalizeChatSummary(chat, booking, currentUserID) {
    const otherParticipantID = currentUserID === booking?.requesterID ? booking?.providerID : booking?.requesterID;
    const latestMessage = (chat.messages || []).at(-1) || null;

    return {
        _id: chat._id?.toString?.() || chat._id,
        bookingID: chat.bookingID,
        senderID: chat.senderID,
        receiverID: chat.receiverID,
        lastMessageAt: chat.lastMessageAt ? new Date(chat.lastMessageAt).toISOString() : null,
        messageCount: (chat.messages || []).length,
        latestMessage: latestMessage
            ? {
                ...latestMessage,
                _id: latestMessage._id?.toString?.() || latestMessage._id,
                createdAt: latestMessage.createdAt ? new Date(latestMessage.createdAt).toISOString() : null
            }
            : null,
        booking: normalizeBooking(booking),
        otherParticipantID
    };
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userID = searchParams.get('userID');

        if (!userID) {
            return NextResponse.json({ error: 'userID is required' }, { status: 400 });
        }

        const chats = await Chat.find({
            $or: [{ senderID: userID }, { receiverID: userID }]
        }).sort({ lastMessageAt: -1, updatedAt: -1 }).lean();

        const bookingIDs = [...new Set(chats.map((chat) => chat.bookingID).filter(Boolean))];
        const bookings = await Booking.find({ _id: { $in: bookingIDs } }).lean();
        const bookingMap = bookings.reduce((acc, booking) => {
            acc[booking._id.toString()] = booking;
            return acc;
        }, {});

        const participantIDs = [...new Set(bookings.flatMap((booking) => [booking.requesterID, booking.providerID]))];
        const users = await FirebaseUser.find({ uid: { $in: participantIDs } }).select('uid displayName email photoURL').lean();
        const userMap = users.reduce((acc, user) => {
            acc[user.uid] = user;
            return acc;
        }, {});

        const serviceIDs = [...new Set(bookings.map((booking) => booking.serviceID))];
        const services = await Service.find({ _id: { $in: serviceIDs } }).lean();
        const serviceMap = services.reduce((acc, service) => {
            acc[service._id.toString()] = service;
            return acc;
        }, {});

        const summaries = chats.map((chat) => {
            const booking = bookingMap[chat.bookingID];
            const enrichedBooking = booking
                ? {
                    ...booking,
                    requester: userMap[booking.requesterID] || null,
                    provider: userMap[booking.providerID] || null,
                    service: serviceMap[booking.serviceID?.toString?.() || booking.serviceID] || null
                }
                : null;

            return normalizeChatSummary(chat, enrichedBooking, userID);
        });

        return NextResponse.json({ success: true, chats: summaries }, { status: 200 });
    } catch (error) {
        console.error('Error fetching chat inbox:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}