let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');

// Счётчик посещений
let Scheme = function () {
  return {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    visitorId: {
      type: DataTypes.INTEGER,
    },
    ratingId: {
      type: DataTypes.INTEGER,
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

const name = 'visitors_counter';
class M_VisitorsCounter extends Model {}

M_VisitorsCounter.init(new Scheme(), {
  sequelize: db,
  modelName: name,
});

module.exports = { M_VisitorsCounter, Scheme, name };
