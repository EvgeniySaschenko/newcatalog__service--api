let { name: tableName, Scheme } = require('./models/backups');
let { $dbMainConnect } = require('./models/_db');

module.exports = {
  tableName,
  // Create report
  async createRecord() {
    let result = await $dbMainConnect.models['backups'].create();
    return result.get({ plain: true });
  },

  // Edit report
  async editRecord({ backupId, report, isError }) {
    let result = await $dbMainConnect.models['backups'].update(
      {
        report,
        isError,
      },
      {
        where: { backupId },
      }
    );
    return result[0];
  },

  // Get backups count
  async getBackupsCount() {
    let result = await $dbMainConnect.models['backups'].count({});
    return result;
  },

  // Get backups
  async getBackups({ offset, limit }) {
    let result = await $dbMainConnect.models['backups'].findAll({
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
