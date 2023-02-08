let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');
let { M_Sites } = require('./sites');

// Отображает к каким разделам относится рейтинг
let Scheme = function () {
  return {
    ratingItemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ratingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    siteId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        checkURL: (url) => {
          try {
            new URL(url);
          } catch (error) {
            throw Error('Ссылка должна начинатся с http или https');
          }
        },
      },
      defaultValue: '',
    },
    name: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (obj) => {
          if (typeof obj !== 'object') throw Error('Неправильный формат данных');
          for (let key in obj) {
            if (obj[key].length > 255) {
              throw Error('Длина названия может быть от 0 до 255 символов');
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
    labelsIds: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (obj) => {
          if (typeof obj !== 'object') throw Error('Неправильный формат данных');
          for (let key in obj) {
            if (!Number.isInteger(obj[key]) || key != obj[key]) {
              throw Error('Неправильный формат данных');
            }
          }

          if (Object.keys(obj).length > 5) {
            throw Error(`Количество ярлыков может быть от 0 до 5`);
          }
        },
      },
      defaultValue: {},
    },
    priority: {
      type: DataTypes.INTEGER(3),
      defaultValue: 0,
    },
    click: {
      type: DataTypes.INTEGER(8),
      defaultValue: 0,
    },
    isHiden: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    dateCreate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  };
};

const name = 'ratings_items';
class M_RatingsItems extends Model {}

M_RatingsItems.init(new Scheme(), {
  sequelize: db,
  modelName: name,
});

M_RatingsItems.belongsTo(M_Sites, {
  foreignKey: 'siteId',
  targetKey: 'siteId',
  as: 'site',
});

module.exports = { M_RatingsItems, Scheme, name };
