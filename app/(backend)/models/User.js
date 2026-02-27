import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  verified: { type: Boolean, default: false },
  studentID: { type: String, default: "" },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);