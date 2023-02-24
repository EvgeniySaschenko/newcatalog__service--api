let { M_Labels, name: tableName } = require(global.ROOT_PATH + '/models/labels.js');

let striptags = require('striptags');
const { Op } = require('sequelize');

module.exports = {
  tableName,
  // Создать ярлык
  async createLabel({ ratingId, name, color }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    let result = await M_Labels.create({
      ratingId,
      name,
      color: striptags(color).toLocaleLowerCase(),
    });
    return result.get({ plain: true });
  },

  // Изменить ярлык
  async editLabel({ labelId, name, color }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    let result = await M_Labels.update(
      { name, color: striptags(color).toLocaleLowerCase() },
      { where: { labelId } }
    );
    return result;
  },

  // Получить ярлыки рейтинга
  async getLabelsRating({ ratingId }) {
    let result = await M_Labels.findAll({
      attributes: ['labelId', 'name', 'color'],
      where: {
        ratingId,
      },
      order: [['name', 'ASC']],
    });
    return result;
  },

  // Получить элементы которые обнослялись после "date" (для создания кеша)
  async getRatingIdsAfterDateUpdate({ date }) {
    let result = await M_Labels.findAll({
      attributes: ['ratingId'],
      where: {
        dateUpdate: {
          [Op.gte]: date,
        },
      },
      group: ['ratingId'],
      order: [['ratingId', 'ASC']],
    });
    return result;
  },

  // Получить ярлык по id
  async getLabelByLabelId({ labelId }) {
    let result = await M_Labels.findOne({
      where: {
        labelId,
      },
    });
    return result;
  },

  // Получить ярлык по имени
  async getLabelRatingByName({ labelId = null, name, ratingId, lang }) {
    let result = await M_Labels.findOne({
      attributes: ['labelId', 'name', 'color'],
      where: {
        ratingId,
        [`name.${lang}`]: name,
        labelId: {
          [Op.ne]: labelId,
        },
      },
    });
    return result;
  },

  // Удалить ярлык
  async deleteLabel({ labelId }) {
    return await M_Labels.destroy({ where: { labelId } });
  },
};
