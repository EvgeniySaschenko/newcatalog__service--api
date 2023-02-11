let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');

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
        checkJSON: (obj) => {
          if (typeof obj !== 'object') throw Error('Неправильный формат данных');
          for (let key in obj) {
            if (obj[key].length < 1 || obj[key].length > 35) {
              throw Error('Название должно быть от 1 до 35 символов');
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
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      validate: {
        is: {
          args: /#([a-f0-9]{6})/,
          msg: 'Значение цвета должно быть в формате HEX (#******)',
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
  };
};

const name = 'labels';
class M_Labels extends Model {}

M_Labels.init(new Scheme(), {
  sequelize: db,
  modelName: name,
});

module.exports = { M_Labels, Scheme, name };
