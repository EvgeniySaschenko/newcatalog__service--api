let puppeteer = require('puppeteer');
let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $resourcesPath } = require(global.ROOT_PATH + '/plugins/resources-path');
let { $config } = require(global.ROOT_PATH + '/plugins/config');

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
          let { url, siteScreenshotId } = this.sites[this.sites.length - 1];
          await this.createScreenshot({ url, siteScreenshotId });
        }
      }
    }, $config['puppeteer'].timeIntervalScreenshotCreate);
  }

  stop() {
    clearInterval(this.idInterval);
  }

  // Create screenshot
  async createScreenshot({ url, siteScreenshotId }) {
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

  // Get sites with a screenshot but no logo
  async getItemsReadyScrenshotNotLogo({ ratingId }) {
    let result = await $dbMain['ratings-items'].getItemsReadyScrenshotNotLogo({ ratingId });
    return result;
  }
}

module.exports = SitesScreenshots;
