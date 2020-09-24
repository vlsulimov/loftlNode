var createError = require("http-errors");
var express = require("express");
var path = require("path");
const passport = require("passport");

var indexRouter = require("./routes/index.js");

var app = express();

app.use(express.static(path.join(__dirname, "../build")));
app.use(express.static(path.join(__dirname, "upload")));

require(path.join(__dirname, 'auth/passport'))
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.use("/api", indexRouter);

app.use('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, "../build/index.html"))
})


module.exports = app;
