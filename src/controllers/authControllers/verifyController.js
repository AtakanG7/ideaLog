
import jwt from "jsonwebtoken";
import client from "../../../apis/redis.js";
import Config from "../../../config/config.js";
import { sendEmail } from "../../../apis/mail.js";
import { sendTelegramMessage } from "../../../apis/telegram.js";

const keyValt = new Config();

import { Users } from "../../models/users.js";

/**
 * Verifies the email address of the user. If the token is valid, sets the
 * isVerified field of the user to true and redirects to the homepage.
 * @param {Object} req - The request sent by the client
 * @param {Object} res - The response to be sent to the client
 */

class verifyController{
    async verifyEmail(req, res) {
        try {
            // Get the verification code
            const email = await client.get(req.query.verificationToken);
    
            if (!email) {
                return res.render('verificationFailurePage', { message: 'Doğrulama kodu bulunamadı. Zaman aşımına uğradı.' });
            }
    
            // Verify the email. Get current user_id from redis by using the uuid from the jwt
            /**
             * Check if the request has a valid jwt token in the authorization header
             * and if the token is valid. If the token is valid, get the user id from redis
             * by using the uuid from the token.
             */
            if (req.headers.cookie && req.headers.cookie.includes('authToken=')) {
                const token = req.headers.cookie.split('authToken=')[1];
                const decoded = jwt.verify(token, keyValt.SECRET_KEY);
                if (decoded.uuid) {
                    // Get the user id from redis
                    const userId = await client.get(decoded.uuid);
                    if (userId) {    
                        const user = await Users.findOne({ _id: userId });
                        if (user) {
                            user.isVerified = true;
                            await user.save();
                            // Send verification success message
                            sendEmail({
                                to: email,
                                subject: 'Email Dogrulama',
                                text: 'Emailiniz onaylandı. Artık sitede post paylaşabilirsiniz. 🤗',
                                html: '/public/html/verificationMailTemplate.html'
                            });
                            res.render('index', { successMessage: 'Email onaylandı. Artık sitede post paylaşabilirsiniz. 🤗' }
                            );
                        } else {
                            return res.render('verificationFailurePage', { message: 'Böyle bir kullanıcı bulunmamaktadır' });
                        }
                    } else {
                        return res.render('verificationFailurePage', { message: 'Doğrulamayı yapmadan önce giriş yapınız' });
                    }
                }
            }else{
                return res.render('verificationFailurePage', { message: 'Doğrulamayı yapmadan önce giriş yapınız' });
            }
        } catch (err) {
            sendTelegramMessage(`[Error] ${err.message}`);
            res.status(500).json({ message: 'Internal server error' ,error: err.message });
        }
    }
}

export default verifyController;