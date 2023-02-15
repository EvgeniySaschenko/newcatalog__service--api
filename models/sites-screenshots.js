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
    url: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    errorMessage: {
      type: DataTypes.JSONB,
      defaultValue: '',
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
    // Date logo created
    dateLogoCreated: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    /*
      If you need to cancel at some point in the process
      But if the logo has already been created, it makes no sense to cancel it. the whole process has been completed.
    */
    dateCanceled: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    // Record creation date
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
