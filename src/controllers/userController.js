import { Users, userSchema } from "../models/users.js";
import { sendTelegramMessage } from "../../apis/services/telegram.js";
import { subscribeToNewsletter, unsubscribeFromNewsletter } from "../../apis/services/mail.js";
import AuthController from "../controllers/authControllers/authController.js";
import axios from "axios";
import client from "../../apis/db/redis.js";

const authController = new AuthController();
export const userController = {

    getProfile: async (req, res) => {
        console.log("git")
        const user = await authController.authControllerMiddlewares.getUserFromSession(req, res)
        console.log(user)
        res.send(user);
    },

    updateProfile: (req, res) => {
        Users.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true })
            .then((user) => {
                res.send(user);
            })  
    },

    subscribeToNewsletter: async (req, res) => {
        await subscribeToNewsletter(req, res);
        // change the status of user to subscribed
        await Users.findOneAndUpdate({ email: req.body.email }, { isSubscribed: true }, { new: true })
    },

    unsubcribeFromNewsletter: async (req, res) => {
        await unsubscribeFromNewsletter(req, res);
    },

    getUserMetadata: async (req, res) => {
        const user = await Users.findById(req.user._id);
        res.send(user);
    },

    validateUser: async (req, res) => {
        const SECRET_KEY = "0x4AAAAAAAxGmUI8MJNKFzjnxN1VUPSrWYY";
        const token = req.body['cf-turnstile-response'];
        const ip = req.headers['cf-connecting-ip'] || req.ip;

        const formData = new URLSearchParams();
        formData.append('secret', SECRET_KEY);
        formData.append('response', token);
        formData.append('remoteip', ip);
    
        try {
            const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
            const result = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const outcome = result.data;
            
            const verificationId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await client.set(verificationId, JSON.stringify(outcome), { EX: 3600 });

            if (outcome.success) {
                res.status(200).json({ 
                    success: true, 
                    message: "Turnstile verification successful",
                    verificationId: verificationId,
                });
            } else {
                res.status(200).json({ 
                    success: false, 
                    message: "Turnstile verification failed", 
                });
            }
        } catch (error) {
            console.error('Turnstile verification error:', error);
            res.status(500).json({ 
                success: false, 
                message: "An error occurred during Turnstile verification" 
            });
        }
    }
}   