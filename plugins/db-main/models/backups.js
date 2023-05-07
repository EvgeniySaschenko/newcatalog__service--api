let { Model, DataTypes } = require('sequelize');
let { $db } = require('./_db');

let Scheme = function () {
  return {
    backupId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isError: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    report: {
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

const name = 'backups';
class M_Backups extends Model {}

M_Backups.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_Backups, Scheme, name };
