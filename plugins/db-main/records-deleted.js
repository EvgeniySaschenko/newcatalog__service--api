let { name: tableName } = require('./models/records-deleted');
let { $dbMainConnect } = require('./models/_db');

module.exports = {
  tableName,
  // Add new record for delete record
  async createRecords({ tableName, tableId, tableRecord }) {
    let result = await $dbMainConnect.models['records_deleted'].create({
      tableName,
      tableId,
      tableRecord,
    });
    return result.get({ plain: true });
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {},
};
