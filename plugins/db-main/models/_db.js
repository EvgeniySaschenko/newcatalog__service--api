let { Sequelize } = require('sequelize');
let { DB_MAIN__NAME_DB, DB_MAIN__HOST_DB, DB_MAIN__USER_DB, DB_MAIN__PASSWORD_DB } = process.env;

// value - using for "records-deleted"
let $tables = {
  ratings: {
    name: 'ratings',
    value: 1,
  },
  'ratings-items': {
    name: 'ratings-items',
    value: 2,
  },
  labels: {
    name: 'labels',
    value: 3,
  },
  sites: {
    name: 'sites',
    value: 4,
  },
  'sites-screenshots': {
    name: 'sites-screenshots',
    value: 5,
  },
  sections: {
    name: 'sections',
    value: 6,
  },
  'records-deleted': {
    name: 'records-deleted',
    value: 7,
  },
};

let sequelize = new Sequelize(DB_MAIN__NAME_DB, DB_MAIN__USER_DB, DB_MAIN__PASSWORD_DB, {
  dialect: 'postgres',
  host: DB_MAIN__HOST_DB,
  define: {
    createdAt: 'dateCreate',
    updatedAt: 'dateUpdate',
    // Чтобы sequelize не делал имя таблицы во множественом числе
    freezeTableName: true,
  },
  // Чтобы в запросы не добавлялись льшние объекты sequelize
  query: {
    raw: true,
  },

  logging: false,
});

module.exports = { $dbMainConnect: sequelize, $tables };
