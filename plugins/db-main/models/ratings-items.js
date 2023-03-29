let { Model, DataTypes } = require('sequelize');
let { $db, $tables } = require('./_db');
let { M_Sites } = require('./sites');
let { M_SitesScreenshots } = require('./sites-screenshots');

let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $errors, $errorsUtils } = require(global.ROOT_PATH + '/plugins/errors');

// Отображает к каким разделам относится рейтинг
let Scheme = function () {
  return {
    ratingItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ratingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    siteId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    visitorId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        checkURL: (url) => {
          try {
            new URL(url);
          } catch (error) {
            throw Error($errors['The link must start with "http" or "https"']);
          }
        },
      },
      defaultValue: '',
    },
    name: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (langs) => {
          $errorsUtils.validateLans({
            langs,
            lengthMin: $config['ratings-items'].nameLengthMin,
            lengthMax: $config['ratings-items'].nameLengthMax,
          });
        },
      },
      defaultValue: $config['lang'].localesObject,
    },
    labelsIds: {
      type: DataTypes.JSONB,
      validate: {
        // example { 1: 1 }
        checkJSON: (labelsIds) => {
          let { labelsIdsMin, labelsIdsMax } = $config['ratings-items'];

          $errorsUtils.validateDependencyIds({
            ids: labelsIds,
            numberMin: labelsIdsMin,
            numberMax: labelsIdsMax,
          });
        },
      },
      defaultValue: {},
    },
    priority: {
      type: DataTypes.INTEGER(3),
      defaultValue: 0,
    },
    click: {
      type: DataTypes.INTEGER(8),
      defaultValue: 0,
    },
    isHiden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
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

const name = 'ratings_items';
class M_RatingsItems extends Model {}

M_RatingsItems.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

M_RatingsItems.belongsTo(M_Sites, {
  foreignKey: 'siteId',
  targetKey: 'siteId',
  as: 'site',
});

M_RatingsItems.belongsTo(M_SitesScreenshots, {
  foreignKey: 'siteId',
  targetKey: 'siteId',
  as: 'site_screenshot',
});

M_Sites.belongsTo(M_RatingsItems, {
  foreignKey: 'siteId',
  targetKey: 'siteId',
  as: 'rating_item',
});

module.exports = { M_RatingsItems, Scheme, name };