let { Model, DataTypes } = require('sequelize');
let { $db, $tables } = require('./_db');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $errors, $errorsUtils } = require(global.ROOT_PATH + '/plugins/errors');

// Рейтинги
let Scheme = function () {
  return {
    ratingId: {
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
        checkJSON: (langs) => {
          $errorsUtils.validateLans({
            langs,
            lengthMin: $config['ratings'].nameLengthMin,
            lengthMax: $config['ratings'].nameLengthMax,
          });
        },
      },
      defaultValue: $config['lang'].localesObject,
    },
    // Описание
    descr: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (langs) => {
          $errorsUtils.validateLans({
            langs,
            lengthMin: $config['ratings'].descrLengthMin,
            lengthMax: $config['ratings'].descrLengthMax,
          });
        },
      },
      defaultValue: $config['lang'].localesObject,
    },
    // Указывает на то что рейтинг скрыт
    isHiden: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Сайты / ютуб...
    typeRating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isType: (type) => {
          if (!Object.values($config['ratings'].typeRating).includes(+type)) {
            throw new Error($errors['Wrong data format']);
          }
        },
      },
    },
    // Сортировка
    typeSort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isType: (type) => {
          if (!Object.values($config['ratings'].typeSort).includes(+type)) {
            throw new Error($errors['Wrong data format']);
          }
        },
      },
    },
    // Плитка, линия
    typeDisplay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isType: (type) => {
          if (!Object.values($config['ratings'].typeDisplay).includes(+type)) {
            throw new Error($errors['Wrong data format']);
          }
        },
      },
    },
    // id разделов к которым привязан рейтинг
    sectionsIds: {
      type: DataTypes.JSONB,
      validate: {
        checkJSON: (sectionsIds) => {
          let { sectionsIdsMin, sectionsIdsMax } = $config['ratings'];
          $errorsUtils.validateDependencyIds({
            ids: sectionsIds,
            numberMin: sectionsIdsMin,
            numberMax: sectionsIdsMax,
          });
        },
      },
      defaultValue: {},
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

const name = 'ratings';
class M_Ratings extends Model {}

M_Ratings.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_Ratings, Scheme, name };
