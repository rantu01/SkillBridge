import mongoose from 'mongoose';

const FirebaseUserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String, default: '' },
  photoURL: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'blocked', 'suspended'], default: 'active' },
  statusReason: { type: String, default: '' },
  suspendedUntil: { type: Date, default: null },
  blockedBy: { type: String, default: null },
  blockedAt: { type: Date, default: null },
  credits: { type: Number, default: 0, min: 0 },
  skills: { type: [String], default: [] },
  creditTransactions: {
    type: [
      {
        type: { type: String, required: true },
        bookingID: { type: String, default: null },
        serviceID: { type: String, default: null },
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
}, { timestamps: true });

FirebaseUserSchema.index({ email: 1 });
FirebaseUserSchema.index({ status: 1 });
FirebaseUserSchema.index({ isVerified: 1 });
FirebaseUserSchema.index({ createdAt: -1 });

// During development, Next.js hot reloading can cause issues with Mongoose models already existing.
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.FirebaseUser;
}

const FirebaseUser = mongoose.models.FirebaseUser || mongoose.model('FirebaseUser', FirebaseUserSchema);

export default FirebaseUser;