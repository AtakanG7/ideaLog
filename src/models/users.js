import { Schema, model } from 'mongoose';

// User Schema
const userSchema = new Schema(
  {
    googleId: { type: String, required: false },
    name: { type: String, required: false },
    email: { type: String, lowercase: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    degree: { type: String, enum: ['Bachelor', 'Master', 'PhD', 'Other'], default: 'Bachelor' },
    visitCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create models from the schemas
const Users = model('Users', userSchema);

export { Users, userSchema };
