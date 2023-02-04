let { Sequelize } = require('sequelize');
let { DB_MAIN__NAME, DB_MAIN__HOST, DB_MAIN__USER, DB_MAIN__PASSWORD } = process.env;

let sequelize = new Sequelize(DB_MAIN__NAME, DB_MAIN__USER, DB_MAIN__PASSWORD, {
  dialect: 'postgres',
  host: DB_MAIN__HOST,
  define: {
    // sequelize не добалял автомтически дату создания/обновления
    timestamps: false,
    // Чтобы sequelize не делал имя таблицы во множественом числе
    freezeTableName: true,
  },
  // Чтобы в запросы не добавлялись льшние объекты sequelize
  query: {
    raw: true,
  },

  logging: false,
});

module.exports = sequelize;
