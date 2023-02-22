let { M_SitesScreenshots } = require(global.ROOT_PATH + '/models/sites-screenshots');

module.exports = {
  // Add an item to the screen creation queue
  async addSiteToProcessing({ url, siteId, isUploadCustomScreenshot = false }) {
    let result = await M_SitesScreenshots.create({
      url,
      siteId,
      isUploadCustomScreenshot,
    });
    return result.get({ plain: true });
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

  /*
    Sites in processing without a screenshot
    isUploadCustomScreenshot - if the value is true, then the screenshot was uploaded manually
  */
  async getSitesProcessingWithoutScreenshot() {
    let result = await M_SitesScreenshots.findAll({
      attributes: ['siteScreenshotId', 'url', 'siteId'],
      where: {
        dateScreenshotCreated: null,
        dateScreenshotError: null,
        isUploadCustomScreenshot: false,
      },
      order: [['dateCreate', 'DESC']],
    });
    return result || [];
  },

  // Get the element that is being processed (check)
  async checkSiteProcessingBySiteId({ siteId }) {
    let result = await M_SitesScreenshots.findOne({
      where: {
        siteId,
        dateScreenshotError: null,
        dateScreenshotCreated: null,
      },
    });

    return result;
  },

  // Get screenshot by id
  async getSiteScreenshotById({ siteScreenshotId }) {
    let result = await M_SitesScreenshots.findOne({
      where: { siteScreenshotId },
    });
    return result;
  },
};
