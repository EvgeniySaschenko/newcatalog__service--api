let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');

// Создание скриншотов сайта
let Scheme = function () {
  return {
    siteScreenshotId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ratingId: {
      type: DataTypes.INTEGER,
    },
    siteId: {
      type: DataTypes.INTEGER,
    },
    typeRating: {
      type: DataTypes.INTEGER(3),
    },
    host: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    // Указывает на то что скриншот отменён
    isСanceled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Указывает на то что скриншот создан
    isCreatedScreen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Указывает на то что скришот находится в оработке
    isProcessed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Указывает на то что создан логотип
    isCreatedLogo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isError: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    errorMessage: {
      type: DataTypes.JSONB,
      defaultValue: '',
    },
    dateUpdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    dateCreate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  };
};

const name = 'sites_screenshots';
class M_SitesScreenshots extends Model {}

M_SitesScreenshots.init(new Scheme(), {
  sequelize: db,
  modelName: name,
});

module.exports = { M_SitesScreenshots, Scheme, name };
