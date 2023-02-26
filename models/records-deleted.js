let { Model, DataTypes } = require('sequelize');
let { $db, $tables } = require('./_db');

// Ярлыки
let Scheme = function () {
  return {
    recordDeletedId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tableName: {
      type: DataTypes.STRING,
      allowNull: false,
      notEmpty: true,
    },
    tableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tableRecord: {
      type: DataTypes.JSONB,
      allowNull: false,
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

const name = 'records_deleted';
class M_Records_deleted extends Model {}

M_Records_deleted.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_Records_deleted, Scheme, name };
