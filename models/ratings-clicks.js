let { Model, DataTypes } = require('sequelize');
let { $db, $tables } = require('./_db');

// Отображает к каким разделам относится рейтинг
let Scheme = function () {
  return {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ratingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

const name = 'ratings_clicks';
class M_RatingsClicks extends Model {}

M_RatingsClicks.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_RatingsClicks, Scheme, name };
