let { name: tableName } = require('./models/ratings-items');
let { M_Sites } = require('./models/sites');
let { M_SitesScreenshots } = require('./models/sites-screenshots');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { Op } = require('sequelize');
let { $dbMainConnect } = require('./models/_db');

module.exports = {
  tableName,
  // Create item
  async createItem({ ratingId, url, siteId, name, host, labelsIds, priority, isHidden }) {
    let result = await $dbMainConnect.models['ratings_items'].create({
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

  // Edit item
  async editItem({ ratingItemId, name, labelsIds, priority, isHiden }) {
    let result = await $dbMainConnect.models['ratings_items'].update(
      {
        name,
        labelsIds,
        priority,
        isHiden,
      },
      { where: { ratingItemId } }
    );
    return result[0];
  },

  // Delete item
  async deleteItem({ ratingItemId }) {
    return await $dbMainConnect.models['ratings_items'].destroy({ where: { ratingItemId } });
  },

  // Get site by url and ratingId (to check for uniqueness)
  async getItemRatingByUrl({ ratingId, url }) {
    let result = await $dbMainConnect.models['ratings_items'].findOne({
      attributes: ['ratingItemId'],
      where: {
        ratingId,
        url,
      },
    });
    return result;
  },

  // Get all rating items by labelId - (Needed to check label when removed)
  async getItemsRatingByLabelId({ labelId }) {
    let result = await $dbMainConnect.models['ratings_items'].findAll({
      attributes: ['ratingItemId', 'labelsIds'],
      where: {
        labelsIds: { [labelId]: labelId },
      },
    });
    return result;
  },

  // Get item by ratingItemId
  async getItemByRatingItemId({ ratingItemId }) {
    let result = await $dbMainConnect.models['ratings_items'].findOne({
      where: {
        ratingItemId,
      },
    });
    return result;
  },

  // Update labels for rating elements (used when deleting a label)
  async editItemsRatingLabel({ ratingItemId, labelsIds }) {
    let result = await $dbMainConnect.models['ratings_items'].update(
      { labelsIds },
      {
        where: {
          ratingItemId,
        },
      }
    );
    return result[0];
  },

  // Get all rating items
  async getItemsRating({ ratingId, typeSort = global.$config['ratings'].typeSort['alexa'] }) {
    let [sortKey, sortValue] = Object.entries(global.$config['ratings'].typeSort).find(
      (item) => item[1] === +typeSort
    );

    let order = {
      alexa: [
        ['priority', 'DESC'],
        [{ model: M_Sites, as: 'site' }, 'alexaRank', 'ASC'],
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

    let result = await $dbMainConnect.models['ratings_items'].findAll({
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
      let { domain, hostname, isSubdomain } = $utils['common'].urlInfo(el.url);
      let resetCache = dateLogoCreate ? new Date(dateLogoCreate).getTime() : '';
      el.logoImg = $utils['paths'].fileProxyPathSiteLogo({
        siteLogoId,
        resetCache,
      });
      el.screenshotImg = $utils['paths'].fileProxyPathScreenshot({ siteScreenshotId });
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

  // Get count items in rating by isHiden
  async getCountItemsRatingByIsHiden({ ratingId, isHiden }) {
    let result = await $dbMainConnect.models['ratings_items'].count({
      where: {
        ratingId,
        isHiden,
      },
    });
    return result;
  },

  // Get items for which there are screenshots but no logos
  async getItemsReadyScrenshotsNotLogo({ ratingId }) {
    let result = await $dbMainConnect.models['ratings_items'].findAll({
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
          screenshotImg: $utils['paths'].fileProxyPathScreenshot({ siteScreenshotId }),
        });
      }
      return total;
    }, []);
  },

  // Get items for which there are screenshots but no logos
  async getItemsScrenshotsErrors({ ratingId }) {
    let result = await $dbMainConnect.models['ratings_items'].findAll({
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

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {
    let all = await $dbMainConnect.models['ratings_items'].findAll();

    for await (let item of all) {
      let ua = item.name['ua'];
      item.name['uk'] = ua;
      delete item.name['ua'];
      await $dbMainConnect.models['ratings_items'].update(
        { name: item.name },
        { where: { ratingItemId: item.ratingItemId } }
      );
    }
  },
};
