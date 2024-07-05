import { Schema, model } from 'mongoose';
import db from "../../apis/db/db.js";

// Blog Post Schema
const blogSchema = new Schema({
    url: { type: String, required: true }, //REQUIRED!!!
    title: { type: String, required: true }, //REQUIRED!!!
    content: { type: String, required: true }, //REQUIRED!!!
    description: { type: String, required: true }, //REQUIRED!!!
    search_keywords: { type: String, required: true }, //REQUIRED!!!
    authorMetadata: { type: Object, required: true }, // REQUIRED!!!
    views: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comments', default: [] }],
    status: { type: String, enum: ['draft', 'review', 'published'], default: 'review' },
    publishedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
}, { timestamps: true });

// Create models from the schemas
const Blogs = db.model('Blogs', blogSchema);

export { Blogs, blogSchema };

