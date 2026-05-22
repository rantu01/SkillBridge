import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    serviceID: { type: String, required: true },
    requesterID: { type: String, required: true },
    providerID: { type: String, required: true },
    timeSlot: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'],
        default: 'Pending'
    },
    meetLink: { type: String, default: null },
    creditEvents: {
        type: [
            {
                type: { type: String, required: true },
                actorID: { type: String, default: null },
                delta: { type: Number, required: true },
                balanceBefore: { type: Number, required: true },
                balanceAfter: { type: Number, required: true },
                title: { type: String, default: '' },
                note: { type: String, default: '' },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        default: []
    },
    events: {
        type: [
            {
                type: { type: String, required: true },
                actorID: { type: String, default: null },
                message: { type: String, default: '' },
                meta: { type: Object, default: {} },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        default: []
    },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    autoApproved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
