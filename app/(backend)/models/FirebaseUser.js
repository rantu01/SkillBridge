import mongoose from 'mongoose';

const FirebaseUserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String, default: '' },
  photoURL: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  skills: { type: [String], default: [] },
}, { timestamps: true });

// During development, Next.js hot reloading can cause issues with Mongoose models already existing.
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.FirebaseUser;
}

const FirebaseUser = mongoose.models.FirebaseUser || mongoose.model('FirebaseUser', FirebaseUserSchema);

export default FirebaseUser;