let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');

// Тип контента
const typeRating = Object.freeze({
  site: true,
});
// Тип отображения
const typeDisplay = Object.freeze({
  tile: true,
  line: true,
});
// Тип сортировки
const typeSort = Object.freeze({
  alexa: true,
  click: true,
  custom: true,
});

// Рейтинги
let Scheme = function () {
  return {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // id пользователя который создал рейтинг
    userId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Название
    name: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (obj) => {
          if (typeof obj !== 'object') throw Error('Неправильный формат данных');
          for (let key in obj) {
            if (obj[key].length < 10 || obj[key].length > 120) {
              throw Error('Длина может быть от 10 до 120 символов');
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
    // Описание
    descr: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (obj) => {
          if (typeof obj !== 'object') throw Error('Неправильный формат данных');
          for (let key in obj) {
            if (obj[key].length > 1000) {
              throw Error('Длина может быть от 0 до 1000 символов');
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
    // Указывает на то что рейтинг скрыт
    isHiden: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Сайты / ютуб...
    typeRating: {
      type: DataTypes.STRING(20),
      checkType: (str) => {
        if (!typeRating[str]) {
          throw Error('Неправильный тип');
        }
      },
    },
    // Сортировко
    typeSort: {
      type: DataTypes.STRING(20),
      checkType: (str) => {
        if (!typeSort[str]) {
          throw Error('Неправильный тип');
        }
      },
    },
    // Плитка, линия
    typeDisplay: {
      type: DataTypes.STRING(20),
      checkType: (str) => {
        if (!typeDisplay[str]) {
          throw Error('Неправильный тип');
        }
      },
    },
    // id разделов к которым привязан рейтинг
    sectionsIds: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (obj) => {
          let count = Object.keys(obj).length;
          if (typeof obj !== 'object') throw Error('Неправильный формат данных');
          for (let key in obj) {
            if (!Number.isInteger(obj[key]) || key != obj[key]) {
              throw Error('Неправильный формат данных');
            }
          }

          if (count < 1 || count > 3) {
            throw Error(`Количество разделов может быть от 1 до 3`);
          }
        },
      },
    },
    visitorId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dateCreate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  };
};

const name = 'ratings';
class M_Ratings extends Model {}

M_Ratings.init(new Scheme(), {
  sequelize: db,
  modelName: name,
});

module.exports = { M_Ratings, Scheme, name, typeRating, typeDisplay, typeSort };
