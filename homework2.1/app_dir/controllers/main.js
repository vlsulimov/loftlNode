const low = require('lowdb');
const path = require('path');

const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.join(__dirname, '../../db', 'db.json'));
const db = low(adapter);

module.exports.get = (req, res) => {
    res.render('index', {products: db.get('products').value()});
}