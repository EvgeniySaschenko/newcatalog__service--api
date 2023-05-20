let { name: tableName } = require('./models/sites-screenshots');
let { $dbMainConnect } = require('./models/_db');

module.exports = {
  tableName,
  // Add an item to the screen creation queue
  async addSiteToProcessing({ url, siteId, isUploadCustomScreenshot = false }) {
    let result = await $dbMainConnect.models['sites_screenshots'].create({
      url,
      siteId,
      isUploadCustomScreenshot,
    });
    return result.get({ plain: true });
  },

  // Screenshot created
  async editScreenshotCreatedSuccess({ siteScreenshotId }) {
    let result = await $dbMainConnect.models['sites_screenshots'].update(
      { dateScreenshotCreated: new Date() },
      {
        where: {
          siteScreenshotId,
        },
      }
    );
    return result[0];
  },

  // Error entry when taking a screenshot
  async editErrorScreenshotCreate({ siteScreenshotId, errorMessage }) {
    let result = await $dbMainConnect.models['sites_screenshots'].update(
      { dateScreenshotError: new Date(), errorMessage },
      {
        where: {
          siteScreenshotId,
        },
      }
    );
    return result[0];
  },

  /*
    Sites in processing without a screenshot
    isUploadCustomScreenshot - if the value is true, then the screenshot was uploaded manually
  */
  async getSitesProcessingWithoutScreenshot() {
    let result = await $dbMainConnect.models['sites_screenshots'].findAll({
      attributes: ['siteScreenshotId', 'url', 'siteId'],
      where: {
        dateScreenshotCreated: null,
        dateScreenshotError: null,
        isUploadCustomScreenshot: false,
      },
      order: [['dateCreate', 'DESC']],
      limit: 10,
    });
    return result || [];
  },

  // Get the element that is being processed (check)
  async checkSiteProcessingBySiteId({ siteId }) {
    let result = await $dbMainConnect.models['sites_screenshots'].findOne({
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
    let result = await $dbMainConnect.models['sites_screenshots'].findOne({
      where: { siteScreenshotId },
    });
    return result;
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {},
};
