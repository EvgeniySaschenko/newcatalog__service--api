let puppeteer = require('puppeteer');
let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let sharp = require('sharp');
let fse = require('fs-extra');
let idIntervalProccessScreenshots = null;
let sitesQueue = [];

class SitesScreenshots {
  // Start the screenshot process
  async initProccessScreenshotsCreates() {
    sitesQueue = [];
    let isBlock = false;
    idIntervalProccessScreenshots = setInterval(async () => {
      if (isBlock) return;
      isBlock = true;
      if (!sitesQueue.length) {
        try {
          sitesQueue = await $dbMain['sites-screenshots'].getSitesProcessingWithoutScreenshot();
        } catch (error) {
          sitesQueue = [];
          console.error(error);
        }
      } else {
        let { url, siteScreenshotId, siteId } = sitesQueue[sitesQueue.length - 1];
        await this.createScreenshot({ url, siteScreenshotId, siteId });
      }
      isBlock = false;
    }, global.$config['puppeteer'].timeIntervalScreenshotCreate);
  }

  // Restart screenshots create process
  async restartProccessScreenshotsCreates() {
    clearInterval(idIntervalProccessScreenshots);
    this.initProccessScreenshotsCreates();
    return true;
  }

  // Add site to processing screenshot create
  async addSiteToProcessing({ siteId, url }) {
    await this.checkSiteProcessing({ siteId });
    await $dbMain['sites'].removeScreenshotInfo({ siteId });
    let { siteScreenshotId } = await $dbMain['sites-screenshots'].addSiteToProcessing({
      url,
      siteId,
    });

    return { siteScreenshotId };
  }

  // Checking if the site is in the queue for creating a screenshot, so as not to add it again
  async checkSiteProcessing({ siteId }) {
    let isScreenshotProcessing = await $dbMain['sites-screenshots'].checkSiteProcessingBySiteId({
      siteId,
    });

    if (isScreenshotProcessing) {
      $utils['errors'].validationMessage({
        path: 'screenshot',
        message: $t('This website is currently in the screenshot queue'),
      });
    }
  }

  // Create screenshot
  async createScreenshot({ url, siteScreenshotId, siteId }) {
    let page;
    let puppeteerBrowser;
    try {
      puppeteerBrowser = await puppeteer.launch(global.$config['puppeteer'].launch);
      page = await puppeteerBrowser.newPage();
      await page.setExtraHTTPHeaders(global.$config['puppeteer'].extraHTTPHeaders);

      await page.setDefaultNavigationTimeout(global.$config['puppeteer'].defaultNavigationTimeout);

      await page.setViewport({
        width: global.$config['puppeteer'].viewportWidth,
        height: global.$config['puppeteer'].viewportHeight,
      });
      await page.setUserAgent(global.$config['puppeteer'].userAgent);
      await page.goto(url);
      await page.screenshot({
        path: $utils['paths'].filePathScreenshot({ siteScreenshotId }),
        type: global.$config['sites'].screenshotFileExtension,
      });
      await $dbMain['sites-screenshots'].editScreenshotCreatedSuccess({
        siteScreenshotId,
      });
      await $dbMain['sites'].editScreenshotInfo({ siteId, siteScreenshotId });
    } catch (error) {
      await $dbMain['sites-screenshots'].editErrorScreenshotCreate({
        siteScreenshotId,
        errorMessage: {
          message: error.message,
          name: error.name,
        },
      });
      console.error(error);
    } finally {
      sitesQueue.pop();
      await puppeteerBrowser.close();
    }
  }

  // A screenshot
  async runCustomScreenshotCreate({ fileImg, siteId }) {
    let tmpFilePath = await this.uploadCustomScreenshot({ fileImg });
    let { siteScreenshotId } = await this.createCustomScreenshot({ tmpFilePath, siteId });
    return { siteScreenshotId };
  }

  // Upload screenshot
  async uploadCustomScreenshot({ fileImg }) {
    let isMimeType = global.$config['sites'].screenshotMimeTypes.includes(fileImg.mimetype);
    let tmpFilePath = $utils['paths'].filePathTmp(fileImg.name);
    if (!isMimeType) {
      $utils['errors'].validationMessage({
        path: 'screenshot',
        message: $t('Incorrect file type'),
      });
    }
    await fileImg.mv(tmpFilePath);

    return tmpFilePath;
  }

  // Create custom screenshot
  async createCustomScreenshot({ tmpFilePath, siteId }) {
    let siteInfoPrev;
    await this.checkSiteProcessing({ siteId });
    let siteScreenshotId;
    let tmpFileMeta = await sharp(tmpFilePath).metadata();

    try {
      // For getting id screenshot
      let result = await $dbMain['sites-screenshots'].addSiteToProcessing({
        url: null,
        siteId,
        isUploadCustomScreenshot: true,
      });
      siteInfoPrev = await $dbMain['sites'].getSiteBySiteId({ siteId });
      await $dbMain['sites'].removeScreenshotInfo({ siteId });
      await $dbMain['sites'].removeLogoInfo({ siteId });

      siteScreenshotId = result.siteScreenshotId;

      // Calculate maximum screenshot dimensions
      let screenshot = $utils['common'].сalcmMaxDimensionsImage({
        height: tmpFileMeta.height,
        width: tmpFileMeta.width,
        maxHeight: global.$config['puppeteer'].viewportHeight,
        maxWidth: global.$config['puppeteer'].viewportWidth,
      });

      // Save screenshot
      await sharp(tmpFilePath)
        .resize({
          width: Math.floor(screenshot.width),
          height: Math.floor(screenshot.height),
        })
        .webp()
        .toFile($utils['paths'].filePathScreenshot({ siteScreenshotId }));

      // Remove screenshot from process
      await $dbMain['sites-screenshots'].editScreenshotCreatedSuccess({
        siteScreenshotId,
      });
      // Update site
      await $dbMain['sites'].editScreenshotInfo({ siteId, siteScreenshotId });
    } catch (error) {
      // Restore
      await $dbMain['sites'].editLogoInfo({
        siteId,
        color: siteInfoPrev.color,
        siteLogoId: siteInfoPrev.siteLogoId,
        dateLogoCreate: siteInfoPrev.dateLogoCreate,
      });
      await $dbMain['sites'].editScreenshotInfo({
        siteId,
        siteScreenshotId: siteInfoPrev.siteScreenshotId || null,
      });
      // Error add
      await $dbMain['sites-screenshots'].editErrorScreenshotCreate({
        siteScreenshotId,
        errorMessage: {
          message: error.message,
          name: error.name,
        },
      });
      throw error;
    } finally {
      await fse.remove(tmpFilePath);
    }
    return { siteScreenshotId };
  }

  // Get sites with a screenshot but no logo
  async getItemsReadyScrenshotsNotLogo({ ratingId }) {
    let result = await $dbMain['ratings-items'].getItemsReadyScrenshotsNotLogo({ ratingId });
    return result;
  }

  // Get sites with error
  async getItemsScrenshotsErrors({ ratingId }) {
    let result = await $dbMain['ratings-items'].getItemsScrenshotsErrors({ ratingId });
    return result;
  }
}

module.exports = SitesScreenshots;
