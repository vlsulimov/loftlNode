const jwt = require('jsonwebtoken')
const path      = require('path');
const helper = require(path.join(__dirname, '../helpers', 'serialize.js'))
const User = require(path.join(__dirname, '../db')).models.user;
require('dotenv').config();
const Secret = 'supersecret'

const createTokens = async (user) => {
    const createToken = await jwt.sign({
            user: {
                id: user.id
            }
        },
        Secret, {
            expiresIn: '12h',
        },
    )
    const createRefreshToken = await jwt.sign({
            user: {
                id: user.id
            }
        },
        Secret, {
            expiresIn: '7d',
        },
    )
    const accessTokenAxpiredAt = jwt.verify(createToken, Secret)
    const refreshTokenAxpiredAt = jwt.verify(createRefreshToken, Secret)
    return {
        accessToken: createToken,
        refreshToken: createRefreshToken,
        accessTokenAxpiredAt: accessTokenAxpiredAt.exp * 100,
        refreshTokenAxpiredAt: refreshTokenAxpiredAt.exp * 1000
    }
}

const refreshTokens = async (refreshToken) => {
    const user = await getUserByToken(refreshToken)
    if (user.id) {
        return {
            ...helper.serializeUser(user),
            ...(await createTokens(user))
        }
    }
}

const getUserByToken = async (token) => {
    try {
        const userId = jwt.verify(token, Secret).user.id
        const user = await User.findOne({
            raw: true,
            where: {
                id: userId
            }
        })
        return user
    } catch (e) {
        console.log(e)
        return false
    }
}

module.exports.createTokens = createTokens 
module.exports.refreshTokens = refreshTokens 
module.exports.getUserByToken = getUserByToken 