
import bcrypt from "bcrypt"
import { Users } from "../../models/users.js";
import { sendTelegramMessage } from "../../../config/telegram.js";
import authControllerMiddlewares from "./authControllerMiddlewares.js";

const authControllerMiddleware = new authControllerMiddlewares();
class loginController {
    
    async logout(req, res, next) {
        try {
            // Destroy the session and clear the cookies
            req.session.destroy((err) => {
                if (err) return next(err);
                res.session.isAuthenticated = false;
                res.clearCookie('authToken');
                res.status(200).json({ message: 'Logout successful' });
            });
        } catch (err) {
            sendTelegramMessage(`[Error] ${err.message}`);
            res.status(500).json({ message: 'Internal server error' ,error: err.message });
        }
    }
    
    async login(req, res, next) {
        try {
            // Check if the user exists in the database
            const user = await Users.findOne({ email: req.body.email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
    
            // Compare the provided password with the stored hashed password
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err || !result) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
            });
            await authControllerMiddleware.createSession(req, res, user);
    
        } catch (err) {
            sendTelegramMessage(`[Error] ${err.message}`);
            res.status(500).json({ message: 'Internal server error' ,error: err.message });
        }
    }

}

export default loginController;