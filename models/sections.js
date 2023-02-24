let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $errorsUtils } = require(global.ROOT_PATH + '/plugins/errors');

// Разделы сайта
let Scheme = function () {
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
          $errorsUtils.validateLans({
            langs,
            lengthMin: $config.sections.nameLengthMin,
            lengthMax: $config.sections.nameLengthMax,
          });
        },
      },
      defaultValue: $config['lang'].localesObject,
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
  sequelize: db,
  modelName: name,
});

module.exports = { M_Sections, Scheme, name };
