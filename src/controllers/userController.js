import { Users, userSchema } from "../models/users.js";
import { sendTelegramMessage } from "../../apis/telegram.js";
import { subscribeToNewsletter, unsubscribeFromNewsletter } from "../../apis/mail.js";

export const userController = {

    getProfile: (req, res) => {
        Users.findById(req.user._id)
            .then((user) => {
                res.send(user);
            })  
    },

    updateProfile: (req, res) => {
        Users.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true })
            .then((user) => {
                res.send(user);
            })  
    },

    subscribeToNewsletter: async (req, res) => {
        await subscribeToNewsletter(req, res);
    },

    unsubcribeFromNewsletter: async (req, res) => {
        await unsubscribeFromNewsletter(req, res);
    }

}

