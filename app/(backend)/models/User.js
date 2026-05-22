import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  verified: { type: Boolean, default: false },
  studentID: { type: String, default: "" },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  credits: { type: Number, default: 0, min: 0 },
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
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);