import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    serviceID: { type: String, required: true },
    requesterID: { type: String, required: true },
    providerID: { type: String, required: true },
    timeSlot: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    meetLink: { type: String, default: null }
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
