const low = require('lowdb');
const path = require('path');

const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.join(__dirname, '../../db', 'db.json'));
const db = low(adapter);

module.exports.get = (req, res) => {
    res.render('login');
};

module.exports.post = (req, res) => {
    if (req.body.email && req.body.password) {
        let user = db.get("user").value();
        if (user.password === req.body.password) {
            req.session.isAdmin = true;
        }
        res.redirect('/admin');
    } else {
        res.render('login')
    }
};