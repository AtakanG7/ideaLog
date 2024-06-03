// Importing required modules
import Config from "./config/config.js";
import session from "express-session";
import express from "express";
import path from "path";
import passport from "passport";
import GoogleStrategy from 'passport-google-oauth20';
import redis from "./apis/redis.js";
import mongoose from "./apis/db.js";
import { sendTelegramMessage } from "./apis/telegram.js";
// Importing routers
import index from "./src/routes/indexRouter.js";
import blogPage from "./src/routes/blogRouter.js";
import bodyParser from "body-parser";
import expressEjsLayouts from "express-ejs-layouts";
import { isActiveRoute, setUserRole } from './src/helpers/routeHelpers.js';

// Getting config values
const keyValt = new Config();

// Declaring the port number
const port = keyValt.PORT || 5000;

// Creating the application
const app = express();

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
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Connecting routers to the application
app.use('/', index)
app.use('/blogs', blogPage)


// Starting the server
const server = app.listen(port, () => console.log(`Listening on ${port}!`));