import mongoose from 'mongoose';

const FirebaseUserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String, default: '' },
  photoURL: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.FirebaseUser || mongoose.model('FirebaseUser', FirebaseUserSchema);