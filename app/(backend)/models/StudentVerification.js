import mongoose from 'mongoose';

const StudentVerificationSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  documentUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.StudentVerification || mongoose.model('StudentVerification', StudentVerificationSchema);