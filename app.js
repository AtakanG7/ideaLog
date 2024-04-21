const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const client = require("fauna")

app.get("/", (req, res) => res.render("index"));

app.get("/blogs", (req, res) => res.render("blogPage"));


// Set EJS as the view engine
app.set('view engine', 'ejs');

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
