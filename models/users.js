let { Model, DataTypes } = require('sequelize');
let { db } = require('./_base.js');

// Пользователи
let Scheme = function () {
  return {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    avatar: {
      type: DataTypes.STRING(32),
      defaultValue: '',
    },
    name: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: {
        isAlphanumeric: {
          msg: 'Имя может содержать только буквы (лат.) или цифры',
        },
        len: {
          args: [3, 100],
          msg: 'Длина может быть от 3 до 100 символов',
        },
      },
    },
    mail: {
      type: DataTypes.STRING,
      unique: true,
      isEmail: true,
      validate: {
        isEmail: { msg: 'Значение должно быть e-mail' },
        len: {
          args: [3, 255],
          msg: 'Поле не может быть пустым. Максимольное количество символов 255',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accessRight: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
      },
      defaultValue: 1,
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

const name = 'users';
class M_Users extends Model {}

M_Users.init(new Scheme(), {
  sequelize: db,
  modelName: name,
});

module.exports = { M_Users, Scheme, name };
