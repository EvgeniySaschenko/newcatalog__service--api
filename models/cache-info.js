let { Model, DataTypes } = require('sequelize');
let { $db, $tables } = require('./_db');

// Ярлыки
let Scheme = function () {
  return {
    cacheInfoId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    visitorId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // table ids changes
    info: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
    dateStartCreate: {
      type: DataTypes.DATE,
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

const name = 'cache_info';
class M_CacheInfo extends Model {}

M_CacheInfo.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_CacheInfo, Scheme, name };
