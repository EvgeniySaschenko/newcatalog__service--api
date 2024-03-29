let { Model, DataTypes } = require('sequelize');
let { $regexp } = require(global.ROOT_PATH + '/plugins/regexp');
let { $dbMainConnect } = require('./_db');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');

let Scheme = function () {
  return {
    siteId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    siteScreenshotId: {
      type: DataTypes.NUMBER,
      defaultValue: null,
    },
    siteLogoId: {
      type: DataTypes.NUMBER,
      defaultValue: null,
    },
    visitorId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    color: {
      type: DataTypes.STRING(7),
      validate: {
        is: {
          args: $regexp.colorHex,
          msg: $t('Color value must be in HEX format'),
        },
      },
      defaultValue: null,
    },
    host: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    alexaRank: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    dateDomainCreate: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    dateLogoCreate: {
      type: DataTypes.DATE,
      defaultValue: null,
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

const name = 'sites';
class M_Sites extends Model {}

M_Sites.init(new Scheme(), {
  sequelize: $dbMainConnect,
  modelName: name,
});

module.exports = { M_Sites, Scheme, name };
