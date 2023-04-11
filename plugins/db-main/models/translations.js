let { Model, DataTypes } = require('sequelize');
let { $db } = require('./_db');
let { $translations } = require(global.ROOT_PATH + '/plugins/translations');

let Scheme = function () {
  let serviceSite = global.$config['services'].site;

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
        checkJSON: (translations) => {
          $translations.validateLangsObject({
            translations,
          });
        },
      },
      defaultValue: $translations.getLangsObject({ serviceName: serviceSite.serviceName }),
    },
    serviceType: {
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
