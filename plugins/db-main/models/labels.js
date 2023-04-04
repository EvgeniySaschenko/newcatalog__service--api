let { Model, DataTypes } = require('sequelize');
let { $db } = require('./_db');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $regexp } = require(global.ROOT_PATH + '/plugins/regexp');
let { $translations, $t } = require(global.ROOT_PATH + '/plugins/translations');

let Scheme = function () {
  return {
    labelId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (langs) => {
          $translations.validateLansObject({
            langs,
            lengthMin: $config['label'].nameLengthMin,
            lengthMax: $config['label'].nameLengthMax,
          });
        },
      },
      defaultValue: $translations.getLansObject({ type: 'site-langs' }),
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
  sequelize: $db,
  modelName: name,
});

module.exports = { M_Labels, Scheme, name };
