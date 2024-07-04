import { Schema, model } from 'mongoose';
import db from "../../apis/db/db.js";

// Comment Schema
const commentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  authorName: { type: String, ref: 'Users', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Blogs', required: true },
  parentComment: { type: Schema.Types.ObjectId, ref: 'Comments' }, // For nested comments
  likes: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Create models from the schemas
const Comments = db.model('Comments', commentSchema);

export { Comments, commentSchema };