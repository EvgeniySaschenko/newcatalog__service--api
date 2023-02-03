let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');

// Отображает к каким разделам относится рейтинг
let Scheme = function () {
  return {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    host: {
      type: DataTypes.STRING,
      defaultValue: '',
      unique: true,
    },
    dateCreate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  };
};

const name = 'ratings_items_img';
class M_RatingsItemsImg extends Model {}

M_RatingsItemsImg.init(new Scheme(), {
  sequelize: db,
  modelName: name,
});

module.exports = { M_RatingsItemsImg, Scheme, name };
