import { Router } from "express";
import passport  from "passport";
import AuthController from "../controllers/authControllers/authController.js";
import { blogController } from "../controllers/blogController.js";
import { userController } from "../controllers/userController.js";
const authController = new AuthController();

const isAuth = [authController.authControllerMiddlewares.mustAuthenticated];
const isAdmin = [authController.authControllerMiddlewares.mustBeAdmin];
// Using express router, creating specific routes
const router = Router()

// Route to render dashboard page
router.get('/dashboard', isAdmin, blogController.getAllBlogs)
  
// Route to render index.ejs
router.get("/", blogController.getPublishedBlogs);

// Route to verify email
router.get('/signup/verification', function (req, res) {
    authController.verifyController.verifyEmail(req, res)
})

router.get("/privacy-policy", function (req, res) {res.render('./pages/privacyPolicy', { currentRoute: '/privacy-policy' })});

// Route to render login.ejs
router.get('/login', function (req, res) {res.render('./pages/loginPage', { currentRoute: '/login' })})

// Route to render signup.ejs
router.get('/signup', function (req, res) {res.render('./pages/signupPage', { currentRoute: '/signup' })})

// login logic to validate req.body.user 
router.post('/login', (req, res) => {
    authController.loginController.login(req, res);
});

// would be implemented here
router.post('/signup', function (req, res, next) {
    authController.signupController.signup(req, res, next)
})

// Google OAuth2 routes
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  async function(req, res) {
      // Successful authentication, redirect home.
    await authController.authControllerMiddlewares.createSession(req, res, req.user);
    res.redirect('/');
}, 
  (err, req, res, next) => {
    res.status(500).json({ message: 'Internal server error' ,error: err.message });
});

// Logout logic
router.get('/logout', function (req, res, next) {
    authController.loginController.logout(req, res, next)
})

export default router;