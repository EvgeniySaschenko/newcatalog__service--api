let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $regexp } = require(global.ROOT_PATH + '/plugins/regexp');
let { $errors, $errorsUtils } = require(global.ROOT_PATH + '/plugins/errors');

// Ярлыки
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
          $errorsUtils.validateLans({
            langs,
            lengthMin: $config.label.nameLengthMin,
            lengthMax: $config.label.nameLengthMax,
          });
        },
      },
      defaultValue: $config['lang'].localesObject,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      validate: {
        is: {
          args: $regexp.colorHex,
          msg: $errors['Color value must be in HEX format'],
        },
      },
    },
    ratingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    visitorId: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true,
      },
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
  sequelize: db,
  modelName: name,
});

module.exports = { M_Labels, Scheme, name };
