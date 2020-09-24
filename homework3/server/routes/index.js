var express = require('express');
var path = require('path');
const passport = require('passport');
var router = express.Router();
const formidable = require('formidable')
const fs = require('fs');
const { Console } = require('console');

const helper = require(path.join(__dirname, '../helpers', 'serialize.js'))
const tokens = require(path.join(__dirname, '../auth', 'tokens.js'))

const User = require(path.join(__dirname, '../db')).models.user;
const News = require(path.join(__dirname, '../db')).models.news;
const Permission = require(path.join(__dirname, '../db')).models.user_permission;

router.post('/login', async (req, res, next) => {
  passport.authenticate("local", {
    session: 'false'
  }, async (err, user) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(400).json({})
    } else {
      const token = await tokens.createTokens(user);
      res.json({
        ...(await helper.serializeUser(user)),
        ...token
      })
    }
  })(req, res, next)
})

const authenticate = (req, res, next) => {
  passport.authenticate('jwt', {
    session: false
  }, (err, user) => {
    if (!user || err) {
      res.status(401).json({
        message: "Unauthorized"
      })
    } else {
      next()
    }
  })(req, res, next)
}

router.post('/registration', async (req, res, next) => {
  const user = await User.findOne({
    raw: true,
    where: {
      username: req.body.username
    }
  });
  if (!user) {
    try {
      const userCreated = await User.create(req.body);
      const token = await tokens.createTokens(userCreated);
      res.json({
        ...(await helper.serializeUser(userCreated)),
        ...token
      })
    } catch (e) {
      res.status(500).json({
        message: e.message
      })
    }
  } else {
    res.status(409).json({
      message: 'User already exists'
    })
  }
})

router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.headers['authorization']
  const data = await tokens.refreshTokens(refreshToken)
  res.json({
    ...data
  })
})

router.get('/profile', authenticate, async (req, res, next) => {
  const token = req.headers['authorization']
  const user = await tokens.getUserByToken(token)
  if (!user) {
    return res.status(400).json({})
  } else {
    res.json({
      ...(await helper.serializeUser(user))
    })
  }
})

router.get('/users', authenticate, async (req, res, next) => {
  try {
    const users = await User.findAll({
      raw: true
    });
    const serialUsers = await Promise.all(users.map(async (user) => {
      return {
        ...(await helper.serializeUser(user))
      }
    }))
    res.json(serialUsers)
  } catch (e) {
    console.log(e)
  }
})

router.patch('/profile', authenticate, async (req, res, next) => {

  let form = new formidable.IncomingForm();
    let upload = path.join(__dirname, '../', 'upload');

    if (!fs.existsSync(upload)) {
        fs.mkdirSync(upload);
    }
    form.uploadDir = upload;
    await form.parse(req, async function (err, fields, files) {
        if (err) {
            return next(err);
        }
        let {
          firstName,
          middleName,
          surName,
          oldPassword,
          newPassword
        } = fields
        const token = req.headers['authorization']
        const user = await tokens.getUserByToken(token)
        if (user && (user.password === oldPassword || !oldPassword)) {
          if (!newPassword) {
            newPassword = user.password
          }
          const fileName = path.join(upload, files.avatar.name);
  
          await fs.rename(files.avatar.path, fileName, async function (err) {
              if (err) {
                  return next(err);
              }
              const data = {
                firstName,
                middleName,
                surName,
                password: newPassword,
                image: files.avatar.name
              }
              await User.update(data, {
                where: {
                  id: user.id
                }
              })
              const _user = await User.findOne({
                raw: true,
                where: {
                  id: user.id
                }
              });
              res.json({
                ...(await helper.serializeUser(_user))
              })
          })
        } else {
          res.status(400).json({})
        }
    })
})

router.delete('/users/:id', authenticate, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;

    await User.destroy({
      where: {
        id
      }
    });
    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
})

router.get('/news', authenticate, async (req, res, next) => {
  try {
    res.json(await getAllNews())
  } catch (e) {
    console.log(e)
  }
})

router.post('/news', authenticate, async (req, res, next) => {
  try {
    const {
      text,
      title
    } = req.body;
    const token = req.headers['authorization']
    const userI = await tokens.getUserByToken(token)
    const userId = userI.id

    await News.create({
      text: text,
      title: title,
      user_id: userId
    })
    res.json(await getAllNews())
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
})

router.patch('/news/:id', authenticate, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    await News.update(req.body, {
      where: {
        id: id
      }
    })
    res.json(await getAllNews())
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
})

router.delete('/news/:id', authenticate, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    await News.destroy({
      where: {
        id: id
      }
    })
    res.json(await getAllNews())
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
})

router.patch('/users/:id/permission', authenticate, async (req, res, next) => {
  try {
    const {
      id
    } = req.params;
    const {
      chat,
      news,
      settings
    } = req.body.permission
    await upsertPermission(chat, 1, id)
    await upsertPermission(news, 2, id)
    await upsertPermission(settings, 3, id)
    res.status(200).json({});
  } catch (err) {
    console.error(err);
    res.status(400).json({});
  }
})

const getAllNews = async () => {
  const news = await News.findAll({
    raw: true
  });
  return await Promise.all(news.map(async (news_post) => {
    const _user = await User.findOne({
      raw: true,
      where: {
        id: news_post.user_id
      }
    });
    return {
      id: news_post.id,
      created_at: news_post.created_at,
      text: news_post.text,
      title: news_post.title,
      user: (await helper.serializeUser(_user))
    }
  }))
}

const upsertPermission = async (permission, typeId, userId) => {
  const exists = await Permission.findOne({
    raw: true,
    where: {
      user_id: userId,
      type: typeId
    }
  })
  if (exists) {
    await Permission.update({
      create: permission.C,
      read: permission.R,
      update: permission.U,
      delete: permission.D
    }, {
      where: {
        id: exists.id
      }
    })
  } else {
    await Permission.create({
      user_id: userId,
      type: typeId,
      create: permission.C,
      read: permission.R,
      update: permission.U,
      delete: permission.D
    })
  }
}

module.exports = router;
