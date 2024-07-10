
import bcrypt from "bcrypt"
import { Users } from "../../models/users.js";
import { sendTelegramMessage } from "../../../apis/services/telegram.js";
import authControllerMiddlewares from "./authControllerMiddlewares.js";

const authControllerMiddleware = new authControllerMiddlewares();
class loginController {
    
    async logout(req, res, next) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    sendTelegramMessage(`[Error] ${err.message}`);
                    return next(err);
                }
                res.clearCookie('authToken');
                res.status(200).redirect('/');
            });
        } catch (err) {
            sendTelegramMessage(`[Error] ${err.message}`);
            res.status(500).json({ message: 'Internal server error' ,error: err.message });
        }
    }
    
    async login(req, res) {
            try {
                // Check if the user exists in the database
                const user = await Users.findOne({ email: req.body.email });
                if (!user) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                await new Promise((resolve, reject) => {
                    bcrypt.compare(req.body.password, user.password, (err, result) => {
                        if (err) {
                            sendTelegramMessage(`[Error] while logging in the user with email ${req.body.email}, error: ${err.message}`);
                            reject(err);
                        } else if (!result) {
                            return res.status(401).redirect('/login');
                        } else {
                            resolve(result);
                        }
                    });
                });

                await authControllerMiddleware.createSession(req, res, user);
                
                return res.status(200).redirect('/');
            } catch (err) {
                sendTelegramMessage(`[Error] ${err.message}`);
                return res.status(500).json({ message: 'Internal server error' ,error: err.message });
            }
    }

}

export default loginController;