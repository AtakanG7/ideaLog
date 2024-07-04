import { Router } from "express";
import passport  from "passport";
import AuthController from "../controllers/authControllers/authController.js";
import { blogController } from "../controllers/blogController.js";
import { userController } from "../controllers/userController.js";
const authController = new AuthController();

const adminRules = [authController.authControllerMiddlewares.isAdmin];
const authRules = [authController.authControllerMiddlewares.isAuthenticated];
// Using express router, creating specific routes
const router = Router()

router.post("/subscribe", userController.subscribeToNewsletter);

router.get("/unsubscribe", (req, res) => {
    res.render("./pages/unsubscribePage", { currentRoute: `/unsubscribe` })
});

router.post("/unsubscribe", userController.unsubcribeFromNewsletter);

router.get("/", userController.getProfile);

export default router;