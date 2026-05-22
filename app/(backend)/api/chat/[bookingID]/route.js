import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Booking from '@/app/(backend)/models/Booking';
import Chat from '@/app/(backend)/models/Chat';

function generateSignature(publicId, timestamp, apiSecret) {
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    return crypto.createHash('sha1').update(signatureString).digest('hex');
}

function normalizeFileLink(file, uploadedBy, index) {
    return {
        url: file.secure_url,
        name: file.original_filename || file.public_id || `attachment-${index + 1}`,
        mimeType: file.format || file.resource_type || '',
        uploadedBy,
        createdAt: new Date()
    };
}

async function uploadFileToCloudinary(file, bookingID, senderID, index) {
    const timestamp = Math.floor(Date.now() / 1000);
    const safeName = (file.name || 'attachment').replace(/[^a-zA-Z0-9._-]+/g, '_');
    const publicId = `chat_${bookingID}_${senderID}_${timestamp}_${index}_${safeName}`;
    const signature = generateSignature(publicId, timestamp, process.env.CLOUDINARY_API_SECRET);
    const isImage = (file.type || '').startsWith('image/');
    const resourcePath = isImage ? 'image/upload' : 'raw/upload';

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('api_key', process.env.CLOUDINARY_API_KEY);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('public_id', publicId);
    cloudinaryFormData.append('signature', signature);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourcePath}`,
        {
            method: 'POST',
            body: cloudinaryFormData
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
    }

    const data = await response.json();
    return normalizeFileLink(data, senderID, index);
}

async function getAuthorizedChatContext(bookingID, userID) {
    const booking = await Booking.findById(bookingID).lean();
    if (!booking) {
        return { error: 'Booking not found', status: 404 };
    }

    if (userID !== booking.requesterID && userID !== booking.providerID) {
        return { error: 'Unauthorized', status: 403 };
    }

    return { booking };
}

function normalizeChat(chat) {
    return {
        ...chat,
        _id: chat._id?.toString?.() || chat._id,
        messages: (chat.messages || []).map((message) => ({
            ...message,
            _id: message._id?.toString?.() || message._id,
            createdAt: message.createdAt ? new Date(message.createdAt).toISOString() : null,
            fileLinks: (message.fileLinks || []).map((file) => ({
                ...file,
                createdAt: file.createdAt ? new Date(file.createdAt).toISOString() : null
            }))
        })),
        fileLinks: (chat.fileLinks || []).map((file) => ({
            ...file,
            createdAt: file.createdAt ? new Date(file.createdAt).toISOString() : null
        })),
        createdAt: chat.createdAt ? new Date(chat.createdAt).toISOString() : null,
        updatedAt: chat.updatedAt ? new Date(chat.updatedAt).toISOString() : null,
        lastMessageAt: chat.lastMessageAt ? new Date(chat.lastMessageAt).toISOString() : null
    };
}

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { bookingID } = await params;
        const { searchParams } = new URL(request.url);
        const userID = searchParams.get('userID');

        if (!bookingID || !userID) {
            return NextResponse.json({ error: 'bookingID and userID are required' }, { status: 400 });
        }

        const context = await getAuthorizedChatContext(bookingID, userID);
        if (context.error) {
            return NextResponse.json({ error: context.error }, { status: context.status });
        }

        const { booking } = context;
        const chat = await Chat.findOneAndUpdate(
            { bookingID },
            {
                $setOnInsert: {
                    bookingID,
                    senderID: booking.requesterID,
                    receiverID: booking.providerID,
                    messages: [],
                    fileLinks: [],
                    lastMessageAt: null
                }
            },
            { new: true, upsert: true }
        ).lean();

        return NextResponse.json({ success: true, chat: normalizeChat(chat) }, { status: 200 });
    } catch (error) {
        console.error('Error fetching chat:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { bookingID } = await params;

        if (!bookingID) {
            return NextResponse.json({ error: 'bookingID is required' }, { status: 400 });
        }

        const contentType = request.headers.get('content-type') || '';
        let senderID = '';
        let message = '';
        let uploadedFiles = [];

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            senderID = String(formData.get('senderID') || '');
            message = String(formData.get('message') || '').trim();
            uploadedFiles = formData.getAll('files').filter(Boolean);
        } else {
            const body = await request.json();
            senderID = String(body.senderID || '');
            message = String(body.message || '').trim();
        }

        if (!senderID) {
            return NextResponse.json({ error: 'senderID is required' }, { status: 400 });
        }

        if (!message && uploadedFiles.length === 0) {
            return NextResponse.json({ error: 'Message text or files are required' }, { status: 400 });
        }

        const context = await getAuthorizedChatContext(bookingID, senderID);
        if (context.error) {
            return NextResponse.json({ error: context.error }, { status: context.status });
        }

        const { booking } = context;
        const receiverID = senderID === booking.requesterID ? booking.providerID : booking.requesterID;

        const chat = await Chat.findOneAndUpdate(
            { bookingID },
            {
                $setOnInsert: {
                    bookingID,
                    senderID: booking.requesterID,
                    receiverID: booking.providerID,
                    messages: [],
                    fileLinks: [],
                    lastMessageAt: null
                }
            },
            { new: true, upsert: true }
        );

        const fileLinks = [];
        for (let index = 0; index < uploadedFiles.length; index += 1) {
            const file = uploadedFiles[index];
            if (file) {
                const uploaded = await uploadFileToCloudinary(file, bookingID, senderID, index);
                fileLinks.push(uploaded);
            }
        }

        const messageEntry = {
            senderID,
            receiverID,
            message,
            fileLinks,
            createdAt: new Date()
        };

        chat.messages = chat.messages || [];
        chat.fileLinks = chat.fileLinks || [];
        chat.messages.push(messageEntry);
        chat.fileLinks.push(...fileLinks);
        chat.lastMessageAt = new Date();

        await chat.save();

        return NextResponse.json({ success: true, chat: normalizeChat(chat), message: messageEntry }, { status: 201 });
    } catch (error) {
        console.error('Error sending chat message:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}