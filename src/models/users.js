import { Schema, model } from 'mongoose';
import db from "../../apis/db/db.js";

// User Schema
const userSchema = new Schema(
  {
    email: { type: String, lowercase: true, required: true },
    password: { type: String, required: true },
    imageURL: { type: String, default: '/img/avatar.jpeg' },
    isSubscribed: { type: Boolean, required: false, default: false },
    googleId: { type: String },
    name: { type: String, default: 'Guest' },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    degree: { type: String, enum: ['Bachelor', 'Master', 'PhD'], default: 'Bachelor' },
    visitCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create models from the schemas
const Users = db.model('Users', userSchema);

export { Users, userSchema };
