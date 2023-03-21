let { Model, DataTypes } = require('sequelize');
let { $db, $tables } = require('./_db');

// Пользователи
let Scheme = function () {
  return {
    userAuthId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mail: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    ip: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    userAgent: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    type: {
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

const name = 'users-auth';
class M_UsersAuth extends Model {}

M_UsersAuth.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_UsersAuth, Scheme, name };
