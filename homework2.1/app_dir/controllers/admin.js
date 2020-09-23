const low = require('lowdb');
const path = require('path');
const formidable = require('formidable')
const fs = require('fs')

const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.join(__dirname, '../../db', 'db.json'));
const db = low(adapter);

module.exports.get = (req, res) => {
    res.render('admin');
}

module.exports.postSkills = (req, res) => {
    if (req.body.age && req.body.concerts && req.body.cities && req.body.years) {
        db.set('skills.age', req.body.age)
            .set('skills.concerts', req.body.concerts)
            .set('skills.cities', req.body.cities)
            .set('skills.years', req.body.years)
            .write();
        res.render('admin');
    } else {
        res.render('admin');
    }
}

module.exports.isAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        return next();
    }
    res.redirect('/');
}

module.exports.postUpload = (req, res, next) => {
    let form = new formidable.IncomingForm();
    let upload = path.join(__dirname, '../../public', 'upload');

    if (!fs.existsSync(upload)) {
        fs.mkdirSync(upload);
    }

    form.uploadDir = upload;

    form.parse(req, function (err, fields, files) {
        if (err) {
            return next(err);
        }

        const valid = validation(fields, files);

        if (valid.err) {
            console.log(valid);
            fs.unlinkSync(files.photo.path);
            return res.render('admin');
        }

        const fileName = path.join(upload, files.photo.name);

        fs.rename(files.photo.path, fileName, function (err) {
            if (err) {
                return next(err);
            }
            let dir =  path.join('upload', files.photo.name);
            db.get('products')
                .push({
                    src: dir,
                    name: fields.name,
                    price: fields.price
                })
                .write();
            res.render('admin');
        })
    })
}

const validation = (fields, files) => {
    if (files.photo.name === '' || files.photo.size === 0) {
        return {
            status: 'Не загружено фото товара!',
            err: true
        }
    }
    if (!fields.name) {
        return {
            status: 'Не указано название товара!',
            err: true
        }
    }
    if (!fields.price) {
        return {
            status: 'Не указана цена товара!',
            err: true
        }
    }
    return {
        status: 'Ok',
        err: false
    }
}