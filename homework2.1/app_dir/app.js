const express = require('express');
const path = require('path');

const bodyParser = require('body-parser');
const session = require('express-session');
const router = require(path.join(__dirname, 'routes', 'index'));
const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../source', 'template', 'pages'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(
    session({
        secret: 'qwe123',
        key: 'authkey',
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: 2 * 60 * 1000
        },
        saveUninitialized: false,
        resave: false
    })
);

app.use('/', router);

app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err) 
})

// error handler
app.use(function (err, req, res, next) {
    // render the error page
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: err
    })
})

const server = app.listen(process.env.PORT || 3000, function () {
    console.log('Сервер запущен на порте: ' + server.address().port);
});
