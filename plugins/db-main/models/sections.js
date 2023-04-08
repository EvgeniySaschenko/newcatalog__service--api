let { Model, DataTypes } = require('sequelize');
let { $db } = require('./_db');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $translations } = require(global.ROOT_PATH + '/plugins/translations');

let Scheme = function () {
  let serviceSite = $config['services'].site;

  return {
    sectionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
    name: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (langs) => {
          $translations.validateLansObject({
            langs,
            lengthMin: $config['sections'].nameLengthMin,
            lengthMax: $config['sections'].nameLengthMax,
          });
        },
      },
      defaultValue: $translations.getLansObject({ type: serviceSite.settingNameLangs }),
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isHiden: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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

const name = 'sections';
class M_Sections extends Model {}

M_Sections.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_Sections, Scheme, name };
