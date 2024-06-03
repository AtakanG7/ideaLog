import { Schema, model } from 'mongoose';

// User Schema
const userSchema = new Schema(
  {
    email: { type: String, lowercase: true, required: true },
    password: { type: String, required: true },
    googleId: { type: String },
    name: { type: String },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    degree: { type: String, enum: ['Bachelor', 'Master', 'PhD'], default: 'Bachelor' },
    visitCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create models from the schemas
const Users = model('Users', userSchema);

export { Users, userSchema };
