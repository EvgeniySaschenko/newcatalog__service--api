let { Model, DataTypes } = require('sequelize');
let { $db } = require('./_db');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { $translations, $t } = require(global.ROOT_PATH + '/plugins/translations');

let Scheme = function () {
  let serviceSite = global.$config['services'].site;

  return {
    ratingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // id of the user who created the rating
    userId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Name
    name: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (langs) => {
          $translations.validateLangsObject({
            langs,
            lengthMin: global.$config['ratings'].nameLengthMin,
            lengthMax: global.$config['ratings'].nameLengthMax,
          });
        },
      },
      defaultValue: $translations.getLangsObject({ serviceName: serviceSite.serviceName }),
    },
    // Description
    descr: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (langs) => {
          $translations.validateLangsObject({
            langs,
            lengthMin: global.$config['ratings'].descrLengthMin,
            lengthMax: global.$config['ratings'].descrLengthMax,
          });
        },
      },
      defaultValue: $translations.getLangsObject({ serviceName: serviceSite.serviceName }),
    },
    // Indicates that the rating is hidden
    isHiden: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Websites / YouTube...
    typeRating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isType: (type) => {
          if (!Object.values(global.$config['ratings'].typeRating).includes(+type)) {
            throw new Error($t('Wrong data format'));
          }
        },
      },
    },
    // Sorting
    typeSort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isType: (type) => {
          if (!Object.values(global.$config['ratings'].typeSort).includes(+type)) {
            throw new Error($t('Wrong data format'));
          }
        },
      },
    },
    // Tile, line
    typeDisplay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isType: (type) => {
          if (!Object.values(global.$config['ratings'].typeDisplay).includes(+type)) {
            throw new Error($t('Wrong data format'));
          }
        },
      },
    },
    // id of the sections to which the rating is attached
    sectionsIds: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (sectionsIds) => {
          let { sectionsIdsMin, sectionsIdsMax } = global.$config['ratings'];
          $utils['common'].validateDependencyIds({
            ids: sectionsIds,
            numberMin: sectionsIdsMin,
            numberMax: sectionsIdsMax,
          });
        },
      },
      defaultValue: {},
    },
    // id of partitions that are in the cache
    sectionsIdsCache: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
    visitorId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dateCreate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    dateUpdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // for sort
    dateFirstPublication: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    dateCacheCreation: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  };
};

const name = 'ratings';
class M_Ratings extends Model {}

M_Ratings.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_Ratings, Scheme, name };
