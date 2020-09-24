'use strict';
module.exports = (sequelize, DataTypes) => {
  const room = sequelize.define('room', {
    name: DataTypes.STRING,
    owner: DataTypes.INTEGER
  }, {});
  room.associate = function(models) {
    room.belongsTo(models.user, {
      foreignKey: 'owner'
    });
  };
  return room;
};
