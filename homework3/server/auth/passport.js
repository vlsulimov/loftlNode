const path = require('path');
const passport = require("passport");
const passportJWT = require("passport-jwt");
const LocalStrategy = require("passport-local");
const User = require(path.join(__dirname, '../db')).models.user;

const Strategy = passportJWT.Strategy
const params = {
    secretOrKey: 'supersecret',
    jwtFromRequest: (req) => {
        let token = null
        if (req && req.headers) {
            token = req.headers['authorization']
        }
        return token
    }
}

passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await User.findOne({
        raw: true,
        where: {
            username: username
        }
    });
    if (user && password === user.password) {
        return done(null, user)
    } else {
        return done(null, false)
    }
}))

passport.use(new Strategy(params, async (payload, done) => {
    try {
        const user = await User.findOne({
            raw: true,
            where: {
                id: payload.user.id
            }
        });
        return done(null, {
            user: {
                id: user.id
            }
        })
    } catch (e) {
        return done(e)
    }
}))

// passport.serializeUser((user, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//     const user = await User.findOne({
//         raw: true,
//         where: {
//             id: id
//         }
//     });
//     if (user) {
//         done(null, user)
//     }
//     done(null, false)
// })
