let { M_Ratings } = require(global.ROOT_PATH + '/models/ratings.js');
let striptags = require('striptags');

module.exports = {
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
    id,
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
        where: { id },
      }
    );
    return result;
  },

  // Получить рейтинг
  async getRating({ id }) {
    let result = await M_Ratings.findOne({
      attributes: [
        'id',
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
        id,
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
        'id',
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
      order: [
        ['isHiden', 'ASC'],
        ['dateCreate', 'DESC'],
      ],
    });
    return result;
  },

  // Получить все видимые рейтинги
  async getRatingsNotHidden() {
    let result = await M_Ratings.findAll({
      attributes: [
        'id',
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
};
