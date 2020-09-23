const express = require('express');
const router = express.Router();

const ctrlMain = require('../controllers/main');
const ctrlLogin = require('../controllers/login');
const ctrlAdmin = require('../controllers/admin');

router.get('/login', ctrlLogin.get);
router.post('/login', ctrlLogin.post);

router.get('/admin', ctrlAdmin.isAdmin, ctrlAdmin.get);
router.post('/admin/skills', ctrlAdmin.isAdmin, ctrlAdmin.postSkills);
router.post('/admin/upload', ctrlAdmin.isAdmin, ctrlAdmin.postUpload);

router.get('/', ctrlMain.get);


module.exports = router
