let { M_RatingsItems } = require(global.ROOT_PATH + '/models/ratings-items');
let { M_Sites } = require(global.ROOT_PATH + '/models/sites');
let { M_SitesScreenshots } = require(global.ROOT_PATH + '/models/sites-screenshots');
let { $resourcesPath } = require(global.ROOT_PATH + '/plugins/resources-path');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { Op } = require('sequelize');

module.exports = {
  // Создать елемент рейтинга
  async createItem({ ratingId, url, siteId, name, host, labelsIds, priority, isHidden }) {
    let result = await M_RatingsItems.create({
      ratingId,
      url,
      siteId,
      name,
      host,
      labelsIds,
      priority,
      isHidden,
    });
    return result.get({ plain: true });
  },

  // Редактировать елемент рейтинга
  async editItem({ ratingItemId, name, labelsIds, priority, isHiden }) {
    let result = await M_RatingsItems.update(
      {
        name,
        labelsIds,
        priority,
        isHiden,
      },
      { where: { ratingItemId } }
    );
    return result;
  },

  // Удалить елемент
  async deleteItem({ ratingItemId }) {
    let result = await M_RatingsItems.destroy({ where: { ratingItemId } });
    return result;
  },

  // Получить сайт по url и ratingId (для проверки на уникальность)
  async getItemRatingByUrl({ ratingId, url }) {
    let result = await M_RatingsItems.findOne({
      attributes: ['ratingItemId'],
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
      attributes: ['ratingItemId', 'labelsIds'],
      where: {
        labelsIds: { [labelId]: labelId },
      },
    });
    return result;
  },

  // Обновляем ярлыки для элементов рейтнга (используется при удалении ярлыка)
  async editItemsRatingLabel({ ratingItemId, labelsIds }) {
    await M_RatingsItems.update(
      { labelsIds },
      {
        where: {
          ratingItemId,
        },
      }
    );
  },

  // Получить все елементы рейтинга
  async getItemsRating({ ratingId, typeSort }) {
    let [sortKey, sortValue] = Object.entries($config.ratings.typeSort).find(
      (item) => item[1] === +typeSort
    );

    let order = {
      alexa: [
        [{ model: M_Sites, as: 'site' }, 'alexaRank', 'ASC'],
        ['priority', 'DESC'],
        ['click', 'DESC'],
        ['ratingItemId', 'ASC'],
      ],
      click: [
        ['priority', 'DESC'],
        ['click', 'DESC'],
        [{ model: M_Sites, as: 'site' }, 'alexaRank', 'ASC'],
        ['ratingItemId', 'ASC'],
      ],
    };

    let result = await M_RatingsItems.findAll({
      attributes: [
        'ratingItemId',
        'ratingId',
        'name',
        'url',
        'labelsIds',
        'priority',
        'click',
        'isHiden',
      ],
      where: {
        ratingId: +ratingId,
      },
      order: order[sortKey],
      include: [
        {
          model: M_Sites,
          attributes: ['siteId', 'color', 'siteScreenshotId', 'alexaRank', 'dateDomainCreate'],
          as: 'site',
        },
      ],
      raw: true,
      nest: true,
    });

    result = result.map((el) => {
      let { siteScreenshotId } = el.site;
      el.site.img = $resourcesPath.fileUrlSiteLogo({ siteScreenshotId });
      return el;
    });
    return result;
  },

  // Get items for which there are screenshots but no logos
  async getItemsReadyScrenshotNotLogo({ ratingId }) {
    let result = await M_RatingsItems.findAll({
      where: {
        ratingId: +ratingId,
      },
      include: [
        {
          model: M_SitesScreenshots,
          where: {
            dateScreenshotCreated: {
              [Op.not]: null,
            },
            dateLogoCreated: null,
            dateCanceled: null,
          },
          as: 'site_screenshot',
        },
      ],
      order: [['dateCreate', 'ASC']],
      raw: true,
      nest: true,
    });

    let unic = {};
    return result.reduce((total, item) => {
      let { siteScreenshotId, url } = item.site_screenshot;
      if (!unic[siteScreenshotId]) {
        unic[siteScreenshotId] = siteScreenshotId;
        total.push({
          siteScreenshotId,
          url,
          img: $resourcesPath.fileUrlScreenshot({ siteScreenshotId }),
        });
      }
      return total;
    }, []);
  },

  // async getItemByImgId({ imgId }) {
  //   let result = await M_RatingsItems.findOne({
  //     attributes: ['whois'],
  //     where: {
  //       imgId,
  //     },
  //   });
  //   return result;
  // },

  // async getItems() {
  //   let result = await M_RatingsItems.findAll({
  //     attributes: ['id', 'imgId', 'alexaRank'],
  //   });
  //   return result;
  // },
};
