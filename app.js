// Required modules
import Config from "./config/config.js";
import session from "express-session";
import express from "express";
import path from "path";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import redis from "./apis/db/redis.js";
import mongoose from "./apis/db/db.js";
import image_server_db from "./apis/db/imagedb.js";
import { sendTelegramMessage } from "./apis/services/telegram.js";
import expressEjsLayouts from "express-ejs-layouts";
import bodyParser from "body-parser";
import { restoreUploadsFolder } from "./src/routes/imageRouter.js";
// Routers
import indexRouter from "./src/routes/indexRouter.js";
import blogRouter from "./src/routes/blogRouter.js";
import userRouter from "./src/routes/userRouter.js";
import imageRouter from "./src/routes/imageRouter.js";

// Helpers
import { isActiveRoute, setUserRole } from './src/helpers/routeHelpers.js';

// Getting config values
const keyValt = new Config();

// Declaring the port number
const port = keyValt.PORT || 5000;

// Creating the application
const app = express();

app.use(cors(
  {
    origin: 'http://localhost:5000',
    credentials: true
  }
));

// Adding parser for cookies
app.use(cookieParser());

app.use(setUserRole);

// Setting up session middleware
app.use(session({
    secret: keyValt.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, maxAge: 60000 }
}))

// Setting up Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configuring Passport serialization and deserialization
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Configuring Google OAuth2 strategy
passport.use(new GoogleStrategy({
    clientID: keyValt.GOOGLE_OAUTH2_ID,
    clientSecret: keyValt.GOOGLE_OAUTH2_SECRET,
    callbackURL: keyValt.GOOGLE_CALLBACK
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    return done(null, profile);
  }
));

// Setting up the requirements

// Setting up view engine and views directory
app.set('view engine', 'ejs');

// Setting up views directory
app.set('views', path.join(process.cwd(), 'src', 'views'));

// Useing the layout file
app.use(expressEjsLayouts);

// Setting up static files directory
app.use(express.static('public'));

app.use(bodyParser({limit: '10mb'}));

// Middleware to serve static files
app.use('/uploads', express.static('uploads'));

// Connecting routers to the application
app.use('/', indexRouter)
app.use('/blogs', blogRouter)
app.use('/users', userRouter)
app.use('/images', imageRouter)
app.use('/*', function(req, res) {
  res.render('./pages/404Page.ejs')
})
// Fetch images from MongoDB
restoreUploadsFolder()

// Starting the server
app.listen(port, () => console.log(`Listening on ${port}!`));