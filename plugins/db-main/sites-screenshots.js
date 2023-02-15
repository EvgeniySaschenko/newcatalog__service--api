let { M_SitesScreenshots } = require(global.ROOT_PATH + '/models/sites-screenshots');
let { Op } = require('sequelize');

module.exports = {
  // Add an item to the screen creation queue
  async addSiteToProcessing({ ratingId, url, siteId }) {
    let result = await M_SitesScreenshots.create({
      ratingId,
      url,
      siteId,
    });
    return result.get({ plain: true });
  },

  // Logo created
  async editLogoCreated({ siteScreenshotId }) {
    await M_SitesScreenshots.update(
      { dateLogoCreated: new Date() },
      {
        where: {
          siteScreenshotId,
        },
      }
    );
  },
  // Screenshot created
  async editScreenshotCreatedSuccess({ siteScreenshotId }) {
    await M_SitesScreenshots.update(
      { dateScreenshotCreated: new Date() },
      {
        where: {
          siteScreenshotId,
        },
      }
    );
  },

  // Error entry when taking a screenshot
  async editErrorScreenshotCreate({ siteScreenshotId, errorMessage }) {
    await M_SitesScreenshots.update(
      { dateScreenshotError: new Date(), errorMessage },
      {
        where: {
          siteScreenshotId,
        },
      }
    );
  },

  // Sites in processing without a screenshot
  async getSitesProcessingWithoutScreenshot() {
    let result = await M_SitesScreenshots.findAll({
      attributes: ['siteScreenshotId', 'url'],
      where: {
        dateScreenshotCreated: null,
        dateCanceled: null,
        dateScreenshotError: null,
      },
      order: [['dateCreate', 'DESC']],
    });
    return result || [];
  },

  // Get the element that is being processed (check)
  async checkSiteProcessingBySiteId({ siteId }) {
    let result = await M_SitesScreenshots.findOne({
      attributes: ['siteScreenshotId', 'siteId'],
      where: {
        siteId,
        dateCanceled: null,
        dateScreenshotError: null,
        dateLogoCreated: null,
      },
    });
    return result;
  },

  // Get screenshot by id
  async getSiteScreenshotById({ siteScreenshotId }) {
    let result = await M_SitesScreenshots.findOne({
      attributes: ['siteId'],
      where: { siteScreenshotId },
    });
    return result;
  },
};
