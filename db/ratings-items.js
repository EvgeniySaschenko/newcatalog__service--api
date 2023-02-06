let { M_RatingsItems } = require(global.ROOT_PATH + '/models/ratings-items.js');
let { M_RatingsItemsImg } = require(global.ROOT_PATH + '/models/ratings-items-img.js');
let config = require(global.ROOT_PATH + '/env.config');

module.exports = {
  // Создать елемент рейтинга
  async createItem({
    ratingId,
    url,
    imgId,
    name,
    whois,
    alexaJson,
    alexaRank,
    host,
    labelsIds,
    priority,
    isHidden,
  }) {
    let result = await M_RatingsItems.create({
      ratingId,
      url,
      imgId,
      name,
      whois,
      alexaJson,
      alexaRank,
      host,
      labelsIds,
      priority,
      isHidden,
    });
    return result.get({ plain: true });
  },

  // Редактировать елемент рейтинга
  async editItem({ id, name, labelsIds, priority, isHiden }) {
    let result = await M_RatingsItems.update(
      {
        name,
        labelsIds,
        priority,
        isHiden,
      },
      { where: { id } }
    );
    return result;
  },

  // Удалить елемент
  async deleteItem({ id }) {
    let result = await M_RatingsItems.destroy({ where: { id } });
    return result;
  },

  // Получить сайт по url и ratingId (для проверки на уникальность)
  async getItemRatingByUrl({ ratingId, url }) {
    let result = await M_RatingsItems.findOne({
      attributes: ['id'],
      where: {
        ratingId,
        url,
      },
    });
    return result;
  },

  // Получить все елементы рейтинга по labelId - (нужны для проверки label при удалении)
  async getItemsRatingByLabelId({ labelId }) {
    let result = await M_RatingsItems.findAll({
      attributes: ['id', 'labelsIds'],
      where: {
        labelsIds: { [labelId]: labelId },
      },
    });
    return result;
  },

  // Обновляем ярлыки для элементов рейтнга (используется при удалении ярлыка)
  async editItemsRatingLabel({ id, labelsIds }) {
    await M_RatingsItems.update(
      { labelsIds },
      {
        where: {
          id,
        },
      }
    );
  },

  // Получить все елементы рейтинга
  async getItemsRating({ ratingId, typeSort }) {
    let order = {
      alexa: [
        ['priority', 'DESC'],
        ['alexaRank', 'ASC'],
        ['click', 'DESC'],
        ['id', 'ASC'],
      ],
      click: [
        ['priority', 'DESC'],
        ['click', 'DESC'],
        ['alexaRank', 'ASC'],
        ['id', 'ASC'],
      ],
    };

    let result = await M_RatingsItems.findAll({
      attributes: [
        'id',
        'ratingId',
        'name',
        'url',
        'whois',
        'labelsIds',
        'priority',
        'click',
        'isHiden',
        'alexaRank',
      ],
      where: {
        ratingId: +ratingId,
      },
      order: order[typeSort],
      include: [
        {
          model: M_RatingsItemsImg,
          attributes: ['id', 'color', 'name'],
          as: 'img',
        },
      ],
      raw: true,
      nest: true,
    });

    result = result.map((el) => {
      el.img.url = config.setSiteLogoUrl(el.img.name);
      return el;
    });
    return result;
  },
};
