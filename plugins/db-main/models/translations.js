let { Model, DataTypes } = require('sequelize');
let { $db, $tables } = require('./_db');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $errorsUtils } = require(global.ROOT_PATH + '/plugins/errors');

// Отображает к каким разделам относится рейтинг
let Scheme = function () {
  return {
    translationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    text: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (langs) => {
          $errorsUtils.validateLans({
            langs,
          });
        },
      },
      defaultValue: $config['lang'].localesObject,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

const name = 'translations';
class M_Translations extends Model {}

M_Translations.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_Translations, Scheme, name };
