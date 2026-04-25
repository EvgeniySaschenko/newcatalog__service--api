let { name: tableName, Scheme } = require('./models/backups-restore');
let { $dbMainConnect } = require('./models/_db');

module.exports = {
  tableName,
  // Create report
  async createRecord() {
    let result = await $dbMainConnect.models['backups_restore'].create();
    return result.get({ plain: true });
  },

  // Edit report
  async editRecord({ backupRestoreId, report, isError }) {
    let result = await $dbMainConnect.models['backups_restore'].update(
      {
        report,
        isError,
      },
      {
        where: { backupRestoreId },
      }
    );
    return result[0];
  },

  // Get backups restore count
  async getCount() {
    let result = await $dbMainConnect.models['backups_restore'].count({});
    return result;
  },

  // Get restores list
  async getRestoresList({ offset, limit }) {
    let result = await $dbMainConnect.models['backups_restore'].findAll({
      order: [['dateCreate', 'DESC']],
      offset,
      limit,
    });
    return result;
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {
    const queryInterface = $dbMainConnect.getQueryInterface();
    await queryInterface.createTable(tableName, new Scheme());
  },
};
