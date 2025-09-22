// Author: Aazaf Ritha
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'employee'], default: 'admin' },
  // Optional NIC number for admin profile
  nic: { type: String, default: '' },
  // Public URL to profile photo served from /uploads/avatars
  photoUrl: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
