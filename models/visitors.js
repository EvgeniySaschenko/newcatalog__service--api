let { Model, DataTypes } = require("sequelize");
let { db } = require("./_base.js");

// Посетители
let Scheme = function () {
  return {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ipV4: {
      type: DataTypes.STRING,
      validate: {
        isIPv4: true,
      },
    },
    ipV6: {
      type: DataTypes.STRING,
      validate: {
        isIPv6: true,
      },
    },
    sessionId: {
      type: DataTypes.INTEGER,
    },
    userAgent: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    dateCreate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  };
};

const name = "visitors";
class M_Visitors extends Model {}

M_Visitors.init(new Scheme(), {
  sequelize: db,
  modelName: name,
});

module.exports = { M_Visitors, Scheme, name };
