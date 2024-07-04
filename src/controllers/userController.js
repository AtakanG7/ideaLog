import { Users, userSchema } from "../models/users.js";
import { sendTelegramMessage } from "../../apis/services/telegram.js";
import { subscribeToNewsletter, unsubscribeFromNewsletter } from "../../apis/services/mail.js";
import AuthController from "../controllers/authControllers/authController.js";
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
    }
}   