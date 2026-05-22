import Booking from '@/app/(backend)/models/Booking';
import FirebaseUser from '@/app/(backend)/models/FirebaseUser';
import Review from '@/app/(backend)/models/Review';
import Service from '@/app/(backend)/models/Service';

const toId = (value) => value?.toString?.() || value || '';

const normalizeReview = (review) => ({
    ...review,
    _id: toId(review._id),
    bookingID: toId(review.bookingID),
    reviewerID: review.reviewerID,
    rating: Number(review.rating || 0),
    feedback: review.feedback || '',
    createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
    updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null
});

const summarizeReviews = (reviews = []) => {
    if (!reviews.length) {
        return { averageRating: 0, reviewCount: 0 };
    }

    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return {
        averageRating: Number((total / reviews.length).toFixed(1)),
        reviewCount: reviews.length
    };
};

export async function getBookingReviewMap(bookingIds = []) {
    const normalizedIds = [...new Set(bookingIds.map(toId).filter(Boolean))];
    if (!normalizedIds.length) {
        return {};
    }

    const reviews = await Review.find({ bookingID: { $in: normalizedIds } }).sort({ createdAt: -1 }).lean();
    return reviews.reduce((acc, review) => {
        acc[toId(review.bookingID)] = normalizeReview(review);
        return acc;
    }, {});
}

export async function getServiceRatingMap(serviceIds = []) {
    const normalizedIds = [...new Set(serviceIds.map(toId).filter(Boolean))];
    if (!normalizedIds.length) {
        return {};
    }

    const bookings = await Booking.find({ serviceID: { $in: normalizedIds }, status: 'Completed' }).select('_id serviceID').lean();
    if (!bookings.length) {
        return normalizedIds.reduce((acc, serviceID) => {
            acc[serviceID] = { averageRating: 0, reviewCount: 0 };
            return acc;
        }, {});
    }

    const bookingIds = bookings.map((booking) => toId(booking._id));
    const reviews = await Review.find({ bookingID: { $in: bookingIds } }).sort({ createdAt: -1 }).lean();
    const bookingMap = bookings.reduce((acc, booking) => {
        acc[toId(booking._id)] = toId(booking.serviceID);
        return acc;
    }, {});

    const serviceReviewMap = reviews.reduce((acc, review) => {
        const serviceID = bookingMap[toId(review.bookingID)];
        if (!serviceID) {
            return acc;
        }

        if (!acc[serviceID]) {
            acc[serviceID] = [];
        }

        acc[serviceID].push(review);
        return acc;
    }, {});

    return normalizedIds.reduce((acc, serviceID) => {
        acc[serviceID] = summarizeReviews(serviceReviewMap[serviceID] || []);
        return acc;
    }, {});
}

export async function getProviderReviewSummary(providerID, { limit = 3 } = {}) {
    if (!providerID) {
        return { summary: { averageRating: 0, reviewCount: 0 }, reviews: [] };
    }

    const services = await Service.find({ ownerID: providerID }).select('_id title ownerID').lean();
    const serviceMap = services.reduce((acc, service) => {
        acc[toId(service._id)] = service;
        return acc;
    }, {});

    const serviceIds = Object.keys(serviceMap);
    if (!serviceIds.length) {
        return { summary: { averageRating: 0, reviewCount: 0 }, reviews: [] };
    }

    const bookings = await Booking.find({ serviceID: { $in: serviceIds }, status: 'Completed' })
        .select('_id serviceID requesterID providerID timeSlot createdAt')
        .sort({ createdAt: -1 })
        .lean();

    const bookingMap = bookings.reduce((acc, booking) => {
        acc[toId(booking._id)] = booking;
        return acc;
    }, {});

    const bookingIds = bookings.map((booking) => toId(booking._id));
    if (!bookingIds.length) {
        return { summary: { averageRating: 0, reviewCount: 0 }, reviews: [] };
    }

    const reviews = await Review.find({ bookingID: { $in: bookingIds } }).sort({ createdAt: -1 }).lean();
    if (!reviews.length) {
        return { summary: { averageRating: 0, reviewCount: 0 }, reviews: [] };
    }

    const reviewerIDs = [...new Set(reviews.map((review) => review.reviewerID).filter(Boolean))];
    const reviewers = reviewerIDs.length
        ? await FirebaseUser.find({ uid: { $in: reviewerIDs } }).select('uid displayName photoURL').lean()
        : [];
    const reviewerMap = reviewers.reduce((acc, reviewer) => {
        acc[reviewer.uid] = reviewer;
        return acc;
    }, {});

    const enrichedReviews = reviews.map((review) => {
        const booking = bookingMap[toId(review.bookingID)] || null;
        const service = booking ? serviceMap[toId(booking.serviceID)] || null : null;

        return {
            ...normalizeReview(review),
            booking: booking ? {
                _id: toId(booking._id),
                serviceID: toId(booking.serviceID),
                requesterID: booking.requesterID,
                providerID: booking.providerID,
                timeSlot: booking.timeSlot ? new Date(booking.timeSlot).toISOString() : null,
                createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : null
            } : null,
            service: service ? {
                _id: toId(service._id),
                title: service.title,
                ownerID: service.ownerID
            } : null,
            reviewer: reviewerMap[review.reviewerID] || null
        };
    });

    return {
        summary: summarizeReviews(reviews),
        reviews: typeof limit === 'number' && limit > 0 ? enrichedReviews.slice(0, limit) : enrichedReviews
    };
}