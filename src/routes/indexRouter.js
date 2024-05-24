import { Router } from "express";
import passport  from "passport";
import AuthController from "../controllers/authControllers/authController.js";
import {Blogs} from "../models/blogs.js";
const authController = new AuthController();

// Using express router, creating specific routes
const router = Router()

// Route to render index.ejs
router.get("/", async (req, res) => {
    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Blogs.aggregate([ { $sort: { createdAt: -1 } } ])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    // Count is deprecated - please use countDocuments
    // const count = await Post.count();
    const count = await Blogs.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('./pages/indexPage', { 
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: '/'
    });
});

// Route to render login.ejs
router.get('/login', function (req, res) {
    // Renders login.ejs file in views folder
    res.render('./pages/loginPage', { currentRoute: '/login' })
})

// Route to render signup.ejs
router.get('/signup', function (req, res) {
    // Renders signup.ejs file in views folder
    res.render('./pages/signupPage', { currentRoute: '/signup' })
})

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
router.get('/auth/google',
  passport.authenticate('google', { scope : ['profile', 'email'] })
);

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

export default router;