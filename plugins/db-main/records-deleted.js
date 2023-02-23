let { M_Records_deleted, name: tableName } = require(global.ROOT_PATH +
  '/models/records-deleted.js');

module.exports = {
  tableName,
  // Add new record
  async createRecords({ tableName, tableId, tableRecord }) {
    let result = await M_Records_deleted.create({
      tableName,
      tableId,
      tableRecord,
    });
    return result.get({ plain: true });
  },
};