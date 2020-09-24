const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const env       = process.env.NODE_ENV || 'development';
const config    = require(path.join(__dirname, 'config.js'))[env];
let models      = {};
const modelsFolderPath = './models';

const sequelize = new Sequelize(`postgres://${config.username}:${config.password}@${config.host}/${config.database}`, config);

fs
  .readdirSync(path.join(__dirname, modelsFolderPath))
  .forEach(file => {
    let model = sequelize['import'](path.join(__dirname, modelsFolderPath, file));
    models[model.name] = model;
  });

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

sequelize.models = models;

module.exports = sequelize;

