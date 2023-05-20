let { Model, DataTypes } = require('sequelize');
let { $dbMainConnect } = require('./_db');
let { $translations } = require(global.ROOT_PATH + '/plugins/translations');

let Scheme = function () {
  let serviceSite = global.$config['services'].site;

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
        checkJSON: (translations) => {
          $translations.validateLangsObject({
            translations,
            lengthMin: global.$config['sections'].nameLengthMin,
            lengthMax: global.$config['sections'].nameLengthMax,
          });
        },
      },
      defaultValue: $translations.getLangsObject({ serviceName: serviceSite.serviceName }),
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
  sequelize: $dbMainConnect,
  modelName: name,
});

module.exports = { M_Sections, Scheme, name };
