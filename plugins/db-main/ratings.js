let { M_Ratings, name: tableName } = require('./models/ratings');
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
    userId,
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
        where: { ratingId, userId },
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

  // Получить количество опубликованых рейтингов в разделе
  async getRatingPublishedCountBySectionId({ sectionId }) {
    let result = await M_Ratings.count({
      where: {
        sectionsIds: {
          [sectionId]: sectionId,
        },
        dateCacheCreation: {
          [Op.ne]: null,
        },
      },
    });
    return result;
  },

  // Получить все рейтинги
  async getRatings() {
    // let maxLimit = 200;
    // offset = offset || 0;
    // limit = limit || 15;
    // limit = limit <= maxLimit ? limit : maxLimit;
    let result = await M_Ratings.findAll({
      order: [
        ['dateCreate', 'DESC'],
        ['dateFirstPublication', 'DESC'],
      ],
    });
    return result;
  },

  // Удалить рейтинг
  async deleteRating({ ratingId }) {
    return await M_Ratings.destroy({ where: { ratingId } });
  },

  // Установить дату первой публикации (определяет последовательность вывода на сайте)
  async editDateFirstPublication({ ratingId }) {
    return await M_Ratings.update(
      {
        dateFirstPublication: new Date(),
      },
      {
        where: { ratingId },
      }
    );
  },
  //   Двта создания кеша
  async editCacheCreation({ ratingId, dateCacheCreation, sectionsIdsCache }) {
    return await M_Ratings.update(
      {
        dateCacheCreation,
        sectionsIdsCache,
      },
      {
        where: { ratingId },
      }
    );
  },
};
