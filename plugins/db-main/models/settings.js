let { Model, DataTypes } = require('sequelize');
let { $db, $tables } = require('./_db');

// Ярлыки
let Scheme = function () {
  return {
    settingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.JSONB,
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

const name = 'settings';
class M_Settings extends Model {}

M_Settings.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_Settings, Scheme, name };