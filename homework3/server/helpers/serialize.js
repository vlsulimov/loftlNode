var path = require('path');
const Permission = require(path.join(__dirname, '../db')).models.user_permission;

serializeUser = async (user) => {
    return {
        id: user.id,
        firstname: user.firstName,
        middleName: user.middleName,
        surName: user.surName,
        username: user.username,
        image: user.image,
        permission: (await serializePermission(user))
    }
}

serializePermission = async (user) => {
    _user_permission = {
        chat: {
            C: false,
            R: false,
            U: false,
            D: false
        },
        news: {
            C: false,
            R: false,
            U: false,
            D: false
        },
        settings: {
            C: false,
            R: false,
            U: false,
            D: false
        }
    }
    try {
        const user_permission = await Permission.findAll({
            raw: true,
            where: {
                user_id: user.id
            }
        });
        for (i in user_permission) {
            permTemp = {
                C: user_permission[i].create,
                R: user_permission[i].read,
                U: user_permission[i].update,
                D: user_permission[i].delete
            }
            switch (user_permission[i].type) {
                case 1:
                    _user_permission.chat = permTemp
                    break
                case 2:
                    _user_permission.news = permTemp
                    break
                case 3:
                    _user_permission.settings = permTemp
                    break
            }
        }
    } catch (e) {
        return _user_permission
    }
    return _user_permission
}

module.exports.serializeUser = serializeUser
module.exports.serializePermission = serializePermission