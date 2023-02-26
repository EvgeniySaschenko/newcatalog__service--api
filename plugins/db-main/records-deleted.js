let { M_Records_deleted, name: tableName } = require(global.ROOT_PATH +
  '/models/records-deleted.js');
let { Op } = require('sequelize');
let lodash = require('lodash');

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

  // Получить элементы которые удалялись во время и после "dateInclAndAfter" (для удаления кеша)
  async getItemsForRatingsCache({ dateInclAndAfter, tableName }) {
    let result = await M_Records_deleted.findAll({
      attributes: ['tableRecord'],
      where: {
        dateUpdate: {
          [Op.gte]: dateInclAndAfter,
        },
        tableName,
      },
      order: [['tableRecord.ratingId', 'ASC']],
    });

    let unicRatingId = lodash.unionBy(result, 'tableRecord.ratingId').map((el) => {
      let { ratingId } = el.tableRecord;
      return { ratingId };
    });
    return unicRatingId;
  },
};
