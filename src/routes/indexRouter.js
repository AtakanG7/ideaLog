import { Router } from "express";
import passport  from "passport";
import AuthController from "../controllers/authControllers/authController.js";
import { blogController } from "../controllers/blogController.js";
import { userController } from "../controllers/userController.js";
const authController = new AuthController();

const adminRules = [authController.authControllerMiddlewares.isAdmin];
// Using express router, creating specific routes
const router = Router()

// Route to render index.ejs
router.get("/", blogController.getPublishedBlogs);

// Route to render login.ejs
router.get('/login', function (req, res) {res.render('./pages/loginPage', { currentRoute: '/login' })})

// Route to render signup.ejs
router.get('/signup', function (req, res) {res.render('./pages/signupPage', { currentRoute: '/signup' })})

// login logic to validate req.body.user 
router.post('/login', function (req, res, next) {
    authController.loginController.login(req, res, next)
})

// would be implemented here
router.post('/signup', function (req, res, next) {
    authController.signupController.signup(req, res, next)
})

// Route to verify email
router.get('/signup/verification/:verificationToken', function (req, res) {
    authController.verifyController.verifyEmail(req, res)
})

// Google OAuth2 routes
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

// Logout logic
router.get('/logout', function (req, res, next) {
    authController.loginController.logout(req, res, next)
})

router.post("/users/subscribe", userController.subscribeToNewsletter);

router.get("/users/unsubscribe", (req, res) => {
    res.render("./pages/unsubscribePage", { currentRoute: `/unsubscribe` })
});

router.post("/users/unsubscribe", userController.unsubcribeFromNewsletter);

export default router;