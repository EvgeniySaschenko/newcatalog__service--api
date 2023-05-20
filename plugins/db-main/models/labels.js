let { Model, DataTypes } = require('sequelize');
let { $dbMainConnect } = require('./_db');
let { $regexp } = require(global.ROOT_PATH + '/plugins/regexp');
let { $translations, $t } = require(global.ROOT_PATH + '/plugins/translations');

let Scheme = function () {
  let serviceSite = global.$config['services'].site;

  return {
    labelId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (translations) => {
          $translations.validateLangsObject({
            translations,
            lengthMin: global.$config['label'].nameLengthMin,
            lengthMax: global.$config['label'].nameLengthMax,
          });
        },
      },
      defaultValue: $translations.getLangsObject({
        serviceName: serviceSite.serviceName,
      }),
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      validate: {
        is: {
          args: $regexp.colorHex,
          msg: $t('Color value must be in HEX format'),
        },
      },
    },
    ratingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  };
};

const name = 'labels';
class M_Labels extends Model {}

M_Labels.init(new Scheme(), {
  sequelize: $dbMainConnect,
  modelName: name,
});

module.exports = { M_Labels, Scheme, name };
