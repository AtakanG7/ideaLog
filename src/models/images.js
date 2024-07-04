import { Schema, model } from 'mongoose';
import image_server_db from "../../apis/db/imagedb.js";

// Images Schema
const ImageSchema = new Schema(
  {
    imageBase64: { type: String, required: true },
    imageFileName: { type: String, required: true },
    imageFileURL: { type: String, required: true },
    imageFileHash: { type: String, required: true },
    imageFileExtension: { type: String, required: false },
    imageFileMimeType: { type: String, required: false },
    imageDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create models from the schemas
const Image = image_server_db.model('images', ImageSchema);

export { Image, ImageSchema };
