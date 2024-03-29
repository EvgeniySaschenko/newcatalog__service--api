let { Model, DataTypes } = require('sequelize');
let { $dbMainConnect } = require('./_db');

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
    visitorId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
  sequelize: $dbMainConnect,
  modelName: name,
});

module.exports = { M_SitesScreenshots, Scheme, name };
