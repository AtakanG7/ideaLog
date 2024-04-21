// YOUR_BASE_DIRECTORY/netlify/functions/

const express = require('express');
const Router = express.Router;

const api = express();

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World!"));

api.use("/api/", router);

const handler = serverless(api);
