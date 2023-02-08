let { M_RatingsLabels } = require(global.ROOT_PATH + '/models/ratings-labels.js');

let striptags = require('striptags');
const { Op } = require('sequelize');

module.exports = {
  // Создать ярлык
  async createLabel({ ratingId, name, color }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }
    let result = await M_RatingsLabels.create({
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
    let result = await M_RatingsLabels.update(
      { name, color: striptags(color).toLocaleLowerCase() },
      { where: { labelId } }
    );
    return result;
  },

  // Изменить ярлык
  async getLabels({ ratingId }) {
    let result = await M_RatingsLabels.findAll({
      attributes: ['labelId', 'name', 'color'],
      where: {
        ratingId,
      },
      order: [['name', 'ASC']],
    });
    return result;
  },

  // Получить ярлык по имени
  async getLabelRatingByName({ labelId = null, name, ratingId, lang }) {
    let result = await M_RatingsLabels.findOne({
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
    return await M_RatingsLabels.destroy({ where: { labelId } });
  },
};
