let { Model, DataTypes } = require("sequelize");
let { db } = require("./_base.js");
let { colorHex } = require(ROOT_PATH + "/core/regexp");

// Ярлыки
let Scheme = function () {
  return {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (obj) => {
          if (typeof obj !== "object") throw Error("Неправильный формат данных");
          for (let key in obj) {
            console.log(obj[key].length);
            if (obj[key].length < 1 || obj[key].length > 35) {
              throw Error("Название должно быть от 1 до 35 символов");
            }
          }

          let isValidLang = "ua" in obj && "ru" in obj;

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
          args: colorHex,
          msg: "Значение цвета должно быть в формате HEX (#******)",
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

const name = "ratings_labels";
class M_RatingsLabels extends Model {}

M_RatingsLabels.init(new Scheme(), {
  sequelize: db,
  modelName: name,
});

module.exports = { M_RatingsLabels, Scheme, name };
