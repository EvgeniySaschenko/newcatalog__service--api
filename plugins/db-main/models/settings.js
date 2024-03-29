let { Model, DataTypes } = require('sequelize');
let { $dbMainConnect } = require('./_db');

let Scheme = function () {
  return {
    settingId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    settingName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceType: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    settingValue: {
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
  sequelize: $dbMainConnect,
  modelName: name,
});

module.exports = { M_Settings, Scheme, name };
