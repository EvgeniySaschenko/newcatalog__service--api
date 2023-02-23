let { M_RatingsItems } = require(global.ROOT_PATH + '/models/ratings-items');
let { M_Sites } = require(global.ROOT_PATH + '/models/sites');
let { M_SitesScreenshots } = require(global.ROOT_PATH + '/models/sites-screenshots');
let { $resourcesPath } = require(global.ROOT_PATH + '/plugins/resources-path');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
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
          attributes: [
            'siteId',
            'color',
            'siteScreenshotId',
            'siteLogoId',
            'alexaRank',
            'dateDomainCreate',
            'dateLogoCreate',
          ],
          as: 'site',
        },
        {
          model: M_SitesScreenshots,
          attributes: ['siteScreenshotId', 'dateScreenshotCreated'],
          where: {
            dateScreenshotError: null,
            dateScreenshotCreated: null,
          },
          required: false,
          as: 'site_screenshot',
        },
      ],
      raw: true,
      nest: true,
    });

    result = result.map((el) => {
      let site = el.site;
      let { siteScreenshotId, siteLogoId, dateLogoCreate } = site;
      let { domain, hostname, isSubdomain } = $utils.urlInfo(el.url);
      let resetCashe = dateLogoCreate ? new Date(dateLogoCreate).getTime() : '';
      el.logoImg = $resourcesPath.fileUrlSiteLogo({
        siteLogoId,
        resetCashe,
      });
      el.screenshotImg = $resourcesPath.fileUrlScreenshot({ siteScreenshotId });
      el.isSubdomain = isSubdomain;
      el.domain = domain;
      el.hostname = hostname;
      // Indicates that the screenshot is in the creation queue.
      el.isScreenshotProcessCreate =
        el.site_screenshot.siteScreenshotId && !el.site_screenshot.dateScreenshotCreated
          ? true
          : false;
      delete el.site;
      return { ...el, ...site };
    });
    return result;
  },

  // Get items for which there are screenshots but no logos
  async getItemsReadyScrenshotsNotLogo({ ratingId }) {
    let result = await M_RatingsItems.findAll({
      where: {
        ratingId: +ratingId,
      },
      include: [
        {
          model: M_Sites,
          where: {
            siteScreenshotId: {
              [Op.not]: null,
            },
            siteLogoId: null,
          },
          as: 'site',
        },
      ],
      order: [['dateCreate', 'ASC']],
      raw: true,
      nest: true,
    });

    let unic = {};
    return result.reduce((total, item) => {
      let { siteScreenshotId, host } = item.site;
      if (!unic[siteScreenshotId]) {
        unic[siteScreenshotId] = siteScreenshotId;
        total.push({
          siteScreenshotId,
          host,
          screenshotImg: $resourcesPath.fileUrlScreenshot({ siteScreenshotId }),
        });
      }
      return total;
    }, []);
  },

  // Get items for which there are screenshots but no logos
  async getItemsScrenshotsErrors({ ratingId }) {
    let result = await M_RatingsItems.findAll({
      where: {
        ratingId: +ratingId,
      },
      include: [
        {
          model: M_SitesScreenshots,
          where: {
            dateScreenshotError: {
              [Op.not]: null,
            },
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
      let { siteScreenshotId, url, dateScreenshotError, errorMessage } = item.site_screenshot;
      if (!unic[siteScreenshotId]) {
        unic[siteScreenshotId] = siteScreenshotId;
        total.push({
          siteScreenshotId,
          url,
          dateScreenshotError,
          errorMessage,
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
