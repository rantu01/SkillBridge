import { NextResponse } from 'next/server';
import dbConnect from '@/app/(backend)/lib/mongodb';
import Booking from '@/app/(backend)/models/Booking';
import Review from '@/app/(backend)/models/Review';
import { getProviderReviewSummary } from '@/app/(backend)/lib/reviews';

const normalizeReview = (review) => ({
    ...review,
    _id: review._id?.toString?.() || review._id,
    bookingID: review.bookingID?.toString?.() || review.bookingID,
    createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
    updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null
});

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const bookingID = searchParams.get('bookingID');
        const providerID = searchParams.get('providerID');
        const limit = Number(searchParams.get('limit') || 3);

        if (bookingID) {
            const review = await Review.findOne({ bookingID }).lean();
            return NextResponse.json({ success: true, review: review ? normalizeReview(review) : null }, { status: 200 });
        }

        if (providerID) {
            const data = await getProviderReviewSummary(providerID, { limit: Number.isFinite(limit) && limit > 0 ? limit : 3 });
            return NextResponse.json({ success: true, ...data }, { status: 200 });
        }

        return NextResponse.json({ error: 'bookingID or providerID is required' }, { status: 400 });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { bookingID, reviewerID, rating, feedback = '' } = body;

        if (!bookingID || !reviewerID || rating === undefined || rating === null) {
            return NextResponse.json({ error: 'bookingID, reviewerID, and rating are required' }, { status: 400 });
        }

        const booking = await Booking.findById(bookingID);
        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.status !== 'Completed') {
            return NextResponse.json({ error: 'Reviews can only be submitted after booking completion' }, { status: 400 });
        }

        if (booking.requesterID !== reviewerID) {
            return NextResponse.json({ error: 'Only the booking requester can submit a review' }, { status: 403 });
        }

        const normalizedRating = Number(rating);
        if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        const trimmedFeedback = typeof feedback === 'string' ? feedback.trim().slice(0, 1000) : '';

        const existingReview = await Review.findOne({ bookingID: booking._id.toString() }).lean();
        if (existingReview) {
            return NextResponse.json({ error: 'A review already exists for this booking' }, { status: 409 });
        }

        const review = await Review.create({
            bookingID: booking._id.toString(),
            reviewerID,
            rating: normalizedRating,
            feedback: trimmedFeedback
        });

        return NextResponse.json({ success: true, review: normalizeReview(review.toObject()) }, { status: 201 });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}