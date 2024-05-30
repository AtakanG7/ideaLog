import { Schema, model } from 'mongoose';

// Blog Post Schema
const blogSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    status: { type: String, enum: ['draft', 'review', 'published'], default: 'review' },
    category: { type: String, enum: ['education', 'gaming', 'programming', 'lifestyle', 'technology', 'javascript', 'AI', 'other'], default: 'other' },
    publishedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
  }, { timestamps: true });

// Create models from the schemas
const Blogs = model('Blogs', blogSchema);

export { Blogs, blogSchema };

