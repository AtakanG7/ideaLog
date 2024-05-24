import { Schema, model } from 'mongoose';

// Blog Post Schema
const blogSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'review', 'published'], default: 'draft' },
    publishedAt: { type: Date }
  }, { timestamps: true });

// Create models from the schemas
const Blogs = model('Blogs', blogSchema);

export { Blogs, blogSchema };

