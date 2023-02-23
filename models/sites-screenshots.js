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
    siteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
    errorMessage: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
    // If you want to use a custom image as the basis for creating a logo (instead of a "puppeteer")
    isUploadCustomScreenshot: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Date screenshot created
    dateScreenshotCreated: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    // If an error occurs while taking a screenshot
    dateScreenshotError: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    // Record creation date
    dateCreate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    dateUpdate: {
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
