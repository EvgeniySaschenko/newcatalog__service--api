let { Model, DataTypes } = require('sequelize');
let { $dbMainConnect } = require('./_db');

// Пользователи
let Scheme = function () {
  return {
    userAuthId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sessionId: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    userId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    email: {
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

const name = 'users_auth';
class M_UsersAuth extends Model {}

M_UsersAuth.init(new Scheme(), {
  sequelize: $dbMainConnect,
  modelName: name,
});

module.exports = { M_UsersAuth, Scheme, name };
