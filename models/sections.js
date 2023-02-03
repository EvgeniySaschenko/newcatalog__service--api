let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');

// Разделы сайта
let Scheme = function () {
  return {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (obj) => {
          if (typeof obj !== 'object') throw Error('Неправильный формат данных');
          for (let key in obj) {
            if (obj[key].length < 3 || obj[key].length > 50) {
              throw Error('Название может быть от 3 до 50 символов');
            }
          }

          let isValidLang = 'ua' in obj && 'ru' in obj;

          if (Object.keys(obj).length != 2 || !isValidLang) {
            throw Error(`Неправильный формат данных`);
          }
        },
      },
      defaultValue: {},
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
    },
    dateCreate: {
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
