
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
                
                // Check if cookie is present
                if (!req.headers.cookie) {
                    return res.status(401).redirect('/login');
                }

                // Get the JWT token from the cookie
                const token = req.headers.cookie.split('=')[1];
                // If the token is not present, return a 401 Unauthorized error
                if (!token) {
                    return res.status(401).redirect('/login');
                }
            
                jwt.verify(token, keyValt.SECRET_KEY);
            
                // If the user is authenticated, call the next middleware function
                return next();
            } catch (err) {
                // If there's an error (e.g., invalid token, expired token), handle it
                sendTelegramMessage(`[Error] ${err.message}`);
                res.status(500).redirect('/login');
            }
        }
        
        // Checks if user is admin
        async mustBeAdmin(req, res, next) {
            try {
                // Check if cookie is present
                if (!req.headers.cookie) {
                    return res.status(401).redirect('/login');
                }
                
                // Get the JWT token from the cookie
                const token = req.headers.cookie.split('=')[1];

                // If the token is not present, return a 401 Unauthorized error
                if (!token) {
                    return res.status(401).redirect('/login');
                }
                
                // Decode the JWT and verify the JWT
                const decoded = jwt.verify(token, keyValt.SECRET_KEY);

                // Check if the user's role is 'admin'
                if (decoded.role === 'admin') {
                    // Set it in res locals
                    res.locals.isAdmin = true;
                    // If the user is an admin, call the next middleware function
                    return next();
                } else {
                    // If the user is not an admin, return a 403 Forbidden error
                    return res.redirect('/login');
                }
            } catch (err) {
                // If there's an error (e.g., invalid token, expired token), handle it
                sendTelegramMessage(`[Error] ${err.message}`);
                res.status(500).redirect('/login');
            }
        }

        async isAdmin(req, res, next) {
            try {
                // Check if cookie is present
                if (!req.headers.cookie) {
                    return false;
                }
                // Get the JWT token from the cookie
                const token = req.headers.cookie.split('=')[1];
                // If the token is not present, return a 401 Unauthorized error
                if (!token) {
                    return false
                }
                // Verify the JWT
                jwt.verify(token, keyValt.SECRET_KEY);

                // Decode the jwt token
                const decodedToken = jwt.decode(token);
                
                // Check if the user's role is 'admin'
                return decodedToken.role === 'admin';
            } catch (err) {
                // If there's an error (e.g., invalid token, expired token), return false
                return false;
            }
        }
        
        /**
         * Checks if the user is authenticated based on the provided JWT token.
         *
         * @param {string} token - The JWT token to be checked.
         * @returns {boolean} - Returns true if the user is authenticated, false otherwise.
         */
        async isAuthenticated(req, res) {
            try {
                // Check if cookie is present
                if (!req.headers.cookie) {
                    return false;
                }
                // Get the JWT token from the cookie
                const token = req.headers.cookie.split('=')[1];
                // If the token is not present, return a 401 Unauthorized error
                if (!token) {
                    return false
                }
                // Decode the JWT and verify the JWT
                jwt.verify(token, keyValt.SECRET_KEY);
            
                // If the token is valid, the user is authenticated
                return true;
            } catch (err) {
                // If there's an error (e.g., invalid token, expired token), return false
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
                // Store the token in an HTTP-only cookie
                res.cookie('authToken', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
                // Store the session UUID in Redis with the user ID as the value for 1 hour
                await client.setEx(sessionUUID, 3600, String(user._id));
                // Setting authenticated to true
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
        
        // Get uuid from JWT and get hte user_id from Redis
        async getUserFromSession(req, res) {
            try {
                // Get the JWT token from the cookie
                const token = req.headers.cookie.split('=')[1];
                // If the token is not present, return a 401 Unauthorized error
                if (!token) {
                    return false
                }
                // Decode the JWT and verify the JWT
                const decoded = jwt.verify(token, keyValt.SECRET_KEY);
                // Get the session UUID
                const sessionUUID = decoded.uuid;
                // Get the user ID from Redis
                const userId = await client.get(sessionUUID);
                // If the user ID is not present, return a 401 Unauthorized error
                if (!userId) {
                    return false
                }
               
                // Get the user from the database
                const user = await Users.findOne({ _id: userId });
                // If the user is not present, return a 401 Unauthorized error
                if (!user) {
                    return false
                }
                
                return user;
            } catch (err) {
                // If there's an error (e.g., invalid token, expired token), handle it
                sendTelegramMessage(`[Error] ${err.message}`);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        }
}

export default authControllerMiddlewares;