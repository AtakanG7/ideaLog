
import client from "../../../config/redis.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import Config from "../../../config/config.js";
import { sendTelegramMessage } from "../../../config/telegram.js";

const keyValt = new Config();

class authControllerMiddlewares{
        /**
     * Checks if user is authenticated
     * 
     * @param {Object} req The request object
     * @param {Object} res The response object
     * @param {Function} next The next middleware function
     */
        async isAuthenticated(req, res, next) {
            // Check if the user is authenticated
            if (req.session.isAuthenticated) {
                // If the user is authenticated, call the next middleware function
                return next();
            }
            
            // If the user is not authenticated, redirect them to the login page
            res.redirect('/login');
        }
    
        // Checks if user is admin
        async isAdmin(req, res, next) {
            try {
                // Get the jwt from the header and decode and check if the role is admin
                if (req.headers.cookie && req.headers.cookie.includes('authToken=')) {
                    const token = req.headers.cookie.split('authToken=')[1];
                    const decoded = jwt.verify(token, keyValt.SECRET_KEY);
                    if (decoded.role === 'admin') {
                        return next();
                    }
                }
                res.status(401).json({ message: 'Unauthorized' });
            } catch (err) {
                sendTelegramMessage(`[Error] ${err.message}`);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
    
    
        /**
         * Creates a new session for the user. Generates a UUID, signs it with the
         * secret key and stores it in a HTTP-only cookie. Stores the UUID in Redis
         * with the user ID as the value for 1 hour.
         * @param {Object} req - The request sent by the client
         * @param {Object} res - The response to be sent to the client
         */
        async createSession(req, res, user) {
            try {
                const sessionUUID = uuidv4();
                const token = jwt.sign({ uuid: sessionUUID, role: user.role }, keyValt.SECRET_KEY, { expiresIn: '1h' });
                // Store the token in an HTTP-only cookie
                res.cookie('authToken', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
                // Store the session UUID in Redis with the user ID as the value for 1 hour
                await client.setEx(sessionUUID, 3600, String(user._id));
            } catch (err) {
                sendTelegramMessage(`[Error] ${err.message}`);
                console.error(err);
            }
        }
}

export default authControllerMiddlewares;