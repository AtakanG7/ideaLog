import client from "../../../apis/db/redis.js";
import bcrypt from "bcrypt"
import Config from "../../../config/config.js";
import generator from "generate-password";
import { sendEmail } from "../../../apis/services/mail.js";
import { sendTelegramMessage } from "../../../apis/services/telegram.js";
import authControllerMiddlewares from "./authControllerMiddlewares.js";
const keyValt = new Config();

import { Users } from "../../models/users.js";

const authControllerMiddleware = new authControllerMiddlewares();
class signupController {
    async signup(req, res) {
        try {
            // Check if the user already exists
            const existingUser = await Users.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(409).json({ error: 'User already exists' });
            }
    
            // Check if the email is valid
            const emailRegex = /^^[^@]+@[^@]+\.[^@]+$/;
            if (!emailRegex.test(req.body.email)) {
                console.log('Invalid email');
                return res.status(400).json({ error: 'Invalid email address' });
            }
    
            // Hash the password
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = new Users({
                email: req.body.email,
                password: hashedPassword,
            });
    
            // Creating a new user
            await user.save();
    
            // Create a new session for the user
            await authControllerMiddleware.createSession(req, res, user);
    
            // Generate a verification code
            var verificationToken = generator.generate({
                length: 10
            });
    
            // Set the current user info into redis for 5 minutes
            await client.setEx(verificationToken, 300*60, req.body.email);
    
            // Send welcome message
            sendEmail({
                to: req.body.email,
                subject: `Hoşgeldiniz`,
                text: `Welcome to the Atakan's Blog. Thank you for signing up. Please verify your email address to start publishing blog posts.`
            });
    
            // Send verification email
            sendEmail({
                to: req.body.email,
                subject: 'Email Dogrulama',
                text: `Kod 6 saat içinde sıfırlanacaktır. Linke tıklayarak emailinizi onaylayın:\n\nhttps://${keyValt.DOMAIN}/signup/verification?email=${req.body.email}&verificationToken=${verificationToken}`
            });
    
            res.redirect(`/`);
        } catch (err) {
            sendTelegramMessage(`[Error] ${err.message}`);
            res.status(500).json({ message: 'Internal server error' ,error: err.message });
        }
    }
}

export default signupController;