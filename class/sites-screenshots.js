let puppeteer = require('puppeteer');
let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $resourcesPath } = require(global.ROOT_PATH + '/plugins/resources-path');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let sharp = require('sharp');
let fse = require('fs-extra');
let path = require('path');

class SitesScreenshots {
  isProcessing = false;
  sites = [];
  idInterval = null;
  // Start the screenshot process
  async initProccessScreenshotsCreates() {
    this.idInterval = setInterval(async () => {
      if (!this.sites.length) {
        this.sites = await $dbMain['sites-screenshots'].getSitesProcessingWithoutScreenshot();
      } else {
        if (!this.isProcessing) {
          let { url, siteScreenshotId, siteId } = this.sites[this.sites.length - 1];
          await this.createScreenshot({ url, siteScreenshotId, siteId });
        }
      }
    }, $config['puppeteer'].timeIntervalScreenshotCreate);
  }

  stop() {
    clearInterval(this.idInterval);
  }

  // Add site to processing screenshot create
  async addSiteToProcessing({ siteId, url }) {
    await this.checkSiteProcessing({ siteId });
    await $dbMain['sites'].removeScreenshotInfo({ siteId });
    let result = await $dbMain['sites-screenshots'].addSiteToProcessing({
      url,
      siteId,
    });

    return result;
  }

  // Checking if the site is in the queue for creating a screenshot, so as not to add it again
  async checkSiteProcessing({ siteId }) {
    let isScreenshotProcessing = await $dbMain['sites-screenshots'].checkSiteProcessingBySiteId({
      siteId,
    });

    if (isScreenshotProcessing) {
      throw {
        errors: [
          {
            path: 'screenshot',
            message: $errors['This site is currently in the screenshot queue'],
          },
        ],
      };
    }
  }

  // Create screenshot
  async createScreenshot({ url, siteScreenshotId, siteId }) {
    let browser;
    let page;

    try {
      this.isProcessing = true;
      browser = await puppeteer.launch($config['puppeteer'].launch);
      page = await browser.newPage();
      await page.setExtraHTTPHeaders($config['puppeteer'].extraHTTPHeaders);

      await page.setDefaultNavigationTimeout($config['puppeteer'].defaultNavigationTimeout);

      await page.setViewport({
        width: $config['puppeteer'].viewportWidth,
        height: $config['puppeteer'].viewportHeight,
      });
      await page.setUserAgent($config['puppeteer'].userAgent);
      await page.goto(url);
      await page.screenshot({
        path: $resourcesPath.filePathScreenshot({ siteScreenshotId }),
        type: $config['sites'].screenshotFileExtension,
      });
      await $dbMain['sites-screenshots'].editScreenshotCreatedSuccess({
        siteScreenshotId,
      });
      await $dbMain['sites'].updateScreenshotInfo({ siteId, siteScreenshotId });
    } catch (error) {
      await $dbMain['sites-screenshots'].editErrorScreenshotCreate({
        siteScreenshotId,
        errorMessage: {
          message: error.message,
          name: error.name,
        },
      });
      console.warn(error);
    } finally {
      this.sites.pop();
      this.isProcessing = false;
      await browser.close();
    }
  }

  // A screenshot
  async runCustomScreenshotCreate({ fileImg, siteId }) {
    let filename = await this.uploadCustomScreenshot({ fileImg });
    return await this.createCustomScreenshot({ filename, siteId });
  }

  // Upload screenshot
  async uploadCustomScreenshot({ fileImg }) {
    let isMimeType = $config.sites.screenshotMimeTypes.includes(fileImg.mimetype);
    let tmpFileName = $resourcesPath.saveTmpFile(fileImg.name);
    if (!isMimeType) {
      throw {
        errors: [{ path: 'screenshot', message: $errors['Invalid file'] }],
      };
    }
    await fileImg.mv(tmpFileName);

    return path.basename(tmpFileName);
  }

  // Create custom screenshot
  async createCustomScreenshot({ filename, siteId }) {
    let siteInfoPrev;
    let tmpFilePath = $resourcesPath.filePathTmp(filename);
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
        maxHeight: $config['puppeteer'].viewportHeight,
        maxWidth: $config['puppeteer'].viewportWidth,
      });

      // Save screenshot
      await sharp(tmpFilePath)
        .resize({
          width: Math.floor(screenshot.width),
          height: Math.floor(screenshot.height),
        })
        .webp()
        .toFile($resourcesPath.filePathScreenshot({ siteScreenshotId }));

      // Remove screenshot from process
      await $dbMain['sites-screenshots'].editScreenshotCreatedSuccess({
        siteScreenshotId,
      });
      // Update site
      await $dbMain['sites'].updateScreenshotInfo({ siteId, siteScreenshotId });
    } catch (error) {
      // Restore
      await $dbMain['sites'].updateLogoInfo({
        siteId,
        color: siteInfoPrev.color,
        siteLogoId: siteInfoPrev.siteLogoId,
        dateLogoCreate: siteInfoPrev.dateLogoCreate,
      });
      await $dbMain['sites-screenshots'].updateScreenshotInfo({
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
