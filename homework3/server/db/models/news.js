'use strict';
module.exports = (sequelize, DataTypes) => {
  const news = sequelize.define('news', {
    text: DataTypes.TEXT,
    title: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {});
  news.associate = function(models) {
    news.belongsTo(models.user, {
      foreignKey: 'user_id'
    });
    // associations can be defined here
  };
  return news;
};