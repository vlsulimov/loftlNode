'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_permission = sequelize.define('user_permission', {
    user_id: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    create: DataTypes.BOOLEAN,
    read: DataTypes.BOOLEAN,
    update: DataTypes.BOOLEAN,
    delete: DataTypes.BOOLEAN
  }, {});
  user_permission.associate = function(models) {
    user_permission.belongsTo(models.user, {
      foreignKey: 'user_id'
    });
    // associations can be defined here
  };
  return user_permission;
};