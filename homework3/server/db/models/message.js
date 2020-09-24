'use strict';
module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define('message', {
    text: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER
  }, {});
  message.associate = function(models) {
    message.belongsTo(models.user, {
      foreignKey: 'user_id'
    });
    message.belongsTo(models.room, {
      foreignKey: 'room_id'
    });
  };
  return message;
};
