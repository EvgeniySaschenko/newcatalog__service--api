let { M_Backups, name: tableName, Scheme } = require('./models/backups');
let { $db } = require('./models/_db');

module.exports = {
  tableName,
  // Create report
  async createRecord() {
    let result = await M_Backups.create();
    return result.get({ plain: true });
  },

  // Edit report
  async editRecord({ backupId, report, isError }) {
    let result = await M_Backups.update(
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
    let result = await M_Backups.count({});
    return result;
  },

  // Get backups
  async getBackups({ offset, limit }) {
    let result = await M_Backups.findAll({
      order: [['dateCreate', 'DESC']],
      offset,
      limit,
    });
    return result;
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {
    const queryInterface = $db.getQueryInterface();
    await queryInterface.createTable(tableName, new Scheme());
  },
};
