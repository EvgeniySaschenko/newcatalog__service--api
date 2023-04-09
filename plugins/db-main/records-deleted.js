let { M_Records_deleted, name: tableName } = require('./models/records-deleted');

module.exports = {
  tableName,
  // Add new record for delete record
  async createRecords({ tableName, tableId, tableRecord }) {
    let result = await M_Records_deleted.create({
      tableName,
      tableId,
      tableRecord,
    });
    return result.get({ plain: true });
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {},
};
