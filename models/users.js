let { Model, DataTypes } = require('sequelize');
let { $db, $tables } = require('./_db');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');

// Пользователи
let Scheme = function () {
  return {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mail: {
      type: DataTypes.STRING,
      unique: true,
      isEmail: true,
      validate: {
        isEmail: { msg: $errors['Value must be e-mail'] },
        len: {
          args: [$config.users.mailLengthMin, $config.users.mailLengthMax],
          msg: $errors['String length range'](
            $config.users.mailLengthMin,
            $config.users.mailLengthMax
          ),
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: null,
    },
    userAgent: {
      type: DataTypes.STRING,
      default: null,
    },
    sessionId: {
      type: DataTypes.STRING,
      unique: true,
    },
    countLoginAttempt: {
      type: DataTypes.INTEGER,
      validate: {
        max: {
          args: [$config.users.loginAttemptMaxCount],
          msg: $errors['Exceeded number of login attempts. Authorization temporarily blocked'],
        },
      },
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
    dateEntry: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    dateLoginAttempt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  };
};

const name = 'users';
class M_Users extends Model {}

M_Users.init(new Scheme(), {
  sequelize: $db,
  modelName: name,
});

module.exports = { M_Users, Scheme, name };
