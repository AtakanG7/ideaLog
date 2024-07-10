import { Router } from "express";
import { Image } from "../models/images.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

// Using express router, creating specific routes
const router = Router();

// Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const day = String(new Date().getDate()).padStart(2, '0');
        const uploadPath = path.join('uploads', year.toString(), month, day);

        // Create folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + ext;
        cb(null, filename);
    }
});

// Initialize upload variable with the storage engine
const upload = multer({ storage ,limits: { fileSize: 500 * 1024 } }); // Limit file size to 500 KB

export async function restoreUploadsFolder() {
    try {
        // Fetch all images from MongoDB, sorted by date
        var images = await Image.find();
        
        // For each image...
        for (const image of images) {
            // Calculate the year, month, and day from the image's upload date
            const year = new Date(image.imageDate).getFullYear();
            const month = String(new Date(image.imageDate).getMonth() + 1).padStart(2, '0');
            const day = String(new Date(image.imageDate).getDate()).padStart(2, '0');
            // Create the directory path
            const dirPath = path.join('uploads', year.toString(), month, day);

            // Check if the directory exists, and if not, create it
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            // Write the image data to a file in the directory
            const filePath = path.join(dirPath, image.imageFileName);
            fs.writeFileSync(filePath, Buffer.from(image.imageBase64, 'base64'));
        }
    } catch (error) {
        console.error(error);
    }
}

export async function compressImage(fileData) {
    return await sharp(fileData)
    .jpeg({ quality: 80 })
    .toBuffer();
}

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        // Get other information like filename, upload date, etc.
        const filename = req.file.filename;
        const splittedFilename = req.file.destination.split(path.sep);
        const year = splittedFilename[1];
        const month = splittedFilename[2];
        const day = splittedFilename[3];

        // Construct the URL of the uploaded file
        const uploadedFileUrl = `${req.protocol}://${req.get('host')}/uploads/${year}/${month}/${day}/${filename}`;
        
        // Read the uploaded file from disk
        const fileData = await new Promise((resolve, reject) => {
            fs.readFile(req.file.path, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
  
        // Compress the image
        const compressedData = await compressImage(fileData);
  
        // Calculate the SHA-256 hash of the compressed file content
        const fileHash = crypto.createHash('sha256').update(compressedData).digest('hex');
  
        // Check if an image with the same hash already exists in the database
        const existingImage = await Image.findOne({ imageFileHash: fileHash });
  
        if (existingImage) {
            // Delete all the uploaded files and save compressed version to the directory
            
            new Promise((resolve, reject) => {
                fs.unlink(req.file.path, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
  
            return res.status(200).json({ url: existingImage.imageFileURL });
        } else {
            // Convert file data to base64
            const base64Data = compressedData.toString('base64');

            new Promise(function(resolve, reject) {
                fs.writeFile(req.file.path, compressedData, function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Save the base64-encoded data to the database
            const image = new Image({
                imageFileName: filename,
                imageBase64: base64Data,
                imageFileURL: uploadedFileUrl,
                imageFileHash: fileHash
            });
            await image.save();
  
            // Save the uploaded file URL to the database or perform other actions
            res.status(200).json({ url: uploadedFileUrl });
        }
    } catch (error) {
        console.error('Error processing the image', error);
        res.status(500).send('Error processing the image');
    }
});

router.post("/upload/single", upload.single("file"), (req, res) => {
    return res.send("Single file");
});

export default router;
