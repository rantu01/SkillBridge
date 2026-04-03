import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    availability: { type: Boolean, default: true },
    image: { type: String, default: '' },
    ownerID: { type: String, required: true }, // UID from Firebase/FirebaseUser
}, { timestamps: true });

// Avoid overwriting model if it already exists
export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
