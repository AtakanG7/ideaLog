import { sendTelegramMessage } from "../../apis/telegram.js";
import { Image } from "../models/images.js";
import { subscribeToNewsletter, unsubscribeFromNewsletter } from "../../apis/mail.js";

import AuthController from "../controllers/authControllers/authController.js";
const authController = new AuthController();

export const imageController = {

    getImages: async (req, res) => {
        try {
            const images = await Image.find();
            res.send(images);
        } catch (error) {
            sendTelegramMessage(`[Error] ${error.message}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    uploadImage: async (req, res) => {
        try {
            const user = await authController.authControllerMiddlewares.getUserFromSession(req, res)
            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const image = new Image({
                user: user._id,
                image: req.file.filename
            });
            await image.save();
            res.send(image);
        } catch (error) {
            sendTelegramMessage(`[Error] ${error.message}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    deleteImage: async (req, res) => {
        try {
            const image = await Image.findById(req.params.id);
            if (!image) {
                return res.status(404).json({ message: "Image not found" });
            }
            if (image.user.toString() !== user._id.toString()) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            await Image.findByIdAndDelete(req.params.id);
            res.send(image);
        } catch (error) {
            sendTelegramMessage(`[Error] ${error.message}`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}   