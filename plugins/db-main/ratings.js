let { M_Ratings, name: tableName } = require(global.ROOT_PATH + '/models/ratings.js');
let striptags = require('striptags');
let { Op } = require('sequelize');

module.exports = {
  tableName,
  // Создать рейтинг
  async createRating({
    userId,
    name,
    descr,
    typeRating,
    typeSort,
    typeDisplay,
    sectionsIds,
    isHiden,
  }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
      descr[key] = striptags(descr[key]);
    }

    let result = await M_Ratings.create({
      userId,
      name,
      descr,
      typeRating,
      typeSort,
      typeDisplay,
      sectionsIds,
      isHiden,
    });
    return result.get({ plain: true });
  },

  // Редактировать рейтинг
  async editRating({
    ratingId,
    name,
    descr,
    isHiden,
    typeRating,
    typeSort,
    typeDisplay,
    sectionsIds,
    visitorId,
  }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
      descr[key] = striptags(descr[key]);
    }

    let result = await M_Ratings.update(
      {
        name,
        descr,
        isHiden,
        typeRating,
        typeSort,
        typeDisplay,
        sectionsIds,
        visitorId,
      },
      {
        where: { ratingId },
      }
    );
    return result;
  },

  // Получить рейтинг
  async getRating({ ratingId }) {
    let result = await M_Ratings.findOne({
      where: {
        ratingId,
      },
    });
    return result;
  },

  // Получить количество рейтингов в разделе
  async getRatingCountBySectionId({ sectionId }) {
    let result = await M_Ratings.count({
      where: {
        sectionsIds: {
          [sectionId]: sectionId,
        },
      },
    });
    return result;
  },

  // Получить все рейтинги пользователя
  async getRatingsUser({ userId }) {
    let result = await M_Ratings.findAll({
      attributes: [
        'ratingId',
        'name',
        'descr',
        'isHiden',
        'typeRating',
        'typeSort',
        'typeDisplay',
        'sectionsIds',
        'dateCreate',
      ],
      where: {
        userId,
      },
      order: [['dateCreate', 'DESC']],
    });
    return result;
  },

  // Получить все видимые рейтинги
  async getRatingsNotHidden() {
    let result = await M_Ratings.findAll({
      attributes: [
        'ratingId',
        'name',
        'descr',
        'typeRating',
        'typeSort',
        'typeDisplay',
        'sectionsIds',
        'dateCreate',
      ],
      where: {
        isHiden: false,
      },
      order: [['dateCreate', 'DESC']],
    });
    return result;
  },

  // Получить элементы которые обнослялись после "date" (для создания кеша)
  async getRatingIdsAfterDateUpdate({ date }) {
    let result = await M_Ratings.findAll({
      attributes: ['ratingId'],
      where: {
        dateUpdate: {
          [Op.gte]: date,
        },
        isHiden: false,
      },
      group: ['ratingId'],
      order: [['ratingId', 'ASC']],
    });
    return result;
  },

  // Удалить рейтинг
  async deleteRating({ ratingId }) {
    return await M_Ratings.destroy({ where: { ratingId } });
  },
};
