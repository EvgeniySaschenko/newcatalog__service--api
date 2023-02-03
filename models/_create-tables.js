global.global.ROOT_PATH = require('app-root-path');
require('dotenv').config();
let { db } = require('./_base');
let users = require('./users');
let sections = require('./sections');
let ratings = require('./ratings');
let ratingsLabels = require('./ratings-labels');
let ratingsItems = require('./ratings-items');
let ratingsItemsImg = require('./ratings-items-img');
let screensProcessing = require('./screens-processing');
let { DataTypes } = require('sequelize');

let models = [
  users,
  sections,
  ratingsLabels,
  ratings,
  ratingsItems,
  ratingsItemsImg,
  screensProcessing,
];
// node models/_create-tables.js
// Создаём таблицы в БД
(async () => {
  // Удалить все теблицы
  // await db.drop();
  // Удалить 1 таблицу
  // ratingsItems.M_RatingsItems.drop();
  // Очистить 1 таблицу
  // ratingsLabels.M_RatingsLabels.destroy({
  //   truncate: true,
  // });
  // screensProcessing.M_SitesProcessing.destroy({
  //   truncate: true,
  // });
  // screensProcessing.M_SitesProcessing.drop();
  // for (let model of models) {
  //   await db.getQueryInterface().createTable(model.name, new model.Scheme());
  // }
  // Добавить колонку
  // db.getQueryInterface().addColumn("ratings_items", "whois", { type: DataTypes.JSONB });
})();
