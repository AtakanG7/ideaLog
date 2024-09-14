
import client from "../../../apis/db/redis.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import Config from "../../../config/config.js";
import { sendTelegramMessage } from "../../../apis/services/telegram.js";
import { Users } from "../../models/users.js";
const keyValt = new Config();

class authControllerMiddlewares{
        /**
         * Checks if user is authenticated
         * 
         * @param {Object} req The request object
         * @param {Object} res The response object
         * @param {Function} next The next middleware function
        */
        async mustAuthenticated(req, res, next) {
            try {
                
                if (!req.cookies.authToken) {
                    return res.status(401).redirect('/login');
                }

                const token = req.cookies.authToken;
                if (!token) {
                    return res.status(401).redirect('/login');
                }
            
                jwt.verify(token, keyValt.SECRET_KEY);
            
                return next();
            } catch (err) {
                sendTelegramMessage(`[Error] ${err.message}`);
                res.status(500).redirect('/login');
            }
        }
        
        async mustBeAdmin(req, res, next) {
            try {
                // Check if cookie is present
                if (!req.cookies.authToken) {
                    return res.status(401).redirect('/login');
                }
                
                const token = req.cookies.authToken;

                if (!token) {
                    return res.status(401).redirect('/login');
                }
                
                const decoded = jwt.verify(token, keyValt.SECRET_KEY);

                if (decoded.role === 'admin') {
                    res.locals.isAdmin = true;
                    return next();
                } else {
                    return res.redirect('/login');
                }
            } catch (err) {
                sendTelegramMessage(`[Error] ${err.message}`);
                res.status(500).redirect('/login');
            }
        }

        async isAdmin(req, res) {
            try {
                
                if (!req.cookies.authToken) {
                    return false;
                }
                const token = req.cookies.authToken;
                if (!token) {
                    return false
                }
                jwt.verify(token, keyValt.SECRET_KEY);

                const decodedToken = jwt.decode(token);
                
                return decodedToken.role === 'admin';
            } catch (err) {
                return false;
            }
        }
        
        /**
         * Checks if the user is authenticated based on the provided JWT token.
         *
         * @param {string} token - The JWT token to be checked.
         * @returns {boolean} - Returns true if the user is authenticated, false otherwise.
         */
        async isAuthenticated(req, res)     {
            try {
                if (!req.cookies.authToken) {
                    return false;
                }
                const token = req.cookies.authToken;
                if (!token) {
                    return false
                }
                jwt.verify(token, keyValt.SECRET_KEY);
            
                return true;
            } catch (err) {
                return false;
            }
        }

        async userExistsIfNoCreateForGoogle(user) {
            try {
                const existingUser = await Users.findOne({ email: user._json.email });
                if (existingUser) {
                    return existingUser;
                } else {
                    const newUser = new Users({
                        email: user._json.email,
                        password: 'googleauth',
                        name: user._json.name,
                        googleId: user.id,
                        isVerified: user._json.email_verified,
                    });
                    await newUser.save();
                    return newUser;
                }
            } catch (err) {
                console.error(`[Error] ${err.message}`);
                throw err;
            }
        }

        /**
         * Creates a new session for the user. Generates a UUID, signs it with the
         * secret key and stores it in a HTTP-only cookie. Stores the UUID in Redis
         * with the user ID as the value for 1 hour.
         * @param {Object} req - The request sent by the client
         * @param {Object} res - The response to be sent to the client
         */
        async createSession(req, res, _user) {
            try {

                // To create session before make sure the user in the db check if user exists with the id first and then with email
                // If the user does not exist create a new user.
                let user = _user;
                if(_user._json){
                    user = await this.userExistsIfNoCreateForGoogle(_user);
                }
                
                const sessionUUID = uuidv4();
                const token = jwt.sign({ uuid: sessionUUID, role: user.role }, keyValt.SECRET_KEY, { expiresIn: '1h' });
                res.cookie('authToken', token, { httpOnly: true, maxAge: 3600000, overwrite: true }); // 1 hour
                await client.setEx(sessionUUID, 3600, String(user._id));
                req.session.isAuthenticated = true;
                req.session.role = user.role;

                return
            } catch (err) {
                sendTelegramMessage(`[Error] In createSession`);
                console.error(err);
            }
        }

        async getUser(req, res) {
            const user = await this.getUserFromSession(req, res);
            return user;
        }   
        
        async getUserFromSession(req, res) {
            try {
                const token = req.cookies.authToken;
                if (!token) {
                    return false
                }
                const decoded = jwt.verify(token, keyValt.SECRET_KEY);
                const sessionUUID = decoded.uuid;
                const userId = await client.get(sessionUUID);
                if (!userId) {
                    return false
                }
               
                const user = await Users.findOne({ _id: userId });
                if (!user) {
                    return false
                }
                
                return user;
            } catch (err) {
                sendTelegramMessage(`[Error] ${err.message}`);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
}

export default authControllerMiddlewares;