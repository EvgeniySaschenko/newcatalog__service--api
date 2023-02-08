let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');

// Отображает к каким разделам относится рейтинг
let Scheme = function () {
  return {
    siteId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    siteScreenshotId: {
      type: DataTypes.NUMBER,
      defaultValue: 0,
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
    alexaRank: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    dateDomainCreate: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    dateCreate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  };
};

const name = 'sites';
class M_Sites extends Model {}

M_Sites.init(new Scheme(), {
  sequelize: db,
  modelName: name,
});

module.exports = { M_Sites, Scheme, name };
