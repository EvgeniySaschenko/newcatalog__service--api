let { M_CacheInfo, name: tableName } = require(global.ROOT_PATH + '/models/cache-info');

module.exports = {
  tableName,
  // Get last record
  async getLastRecord() {
    let result = await M_CacheInfo.findOne({
      order: [['dateStartCreate', 'DESC']],
    });
    return result;
  },

  // Save info about created cashes
  async createItem({ tablesIds, dateStartCreate }) {
    let result = await M_CacheInfo.create({
      tablesIds,
      dateStartCreate,
    });
    return result.get({ plain: true });
  },
};
