import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    bookingID: { type: String, required: true, unique: true, index: true },
    reviewerID: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);