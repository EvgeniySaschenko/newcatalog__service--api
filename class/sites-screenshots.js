let puppeteer = require('puppeteer');
let db = require(global.ROOT_PATH + '/db');
let config = require(global.ROOT_PATH + '/env.config');

class SitesScreenshots {
  userAgent =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36';
  isProcessing = false;
  sites = [];
  idInterval = null;

  async init() {
    this.sites = await db['sites-screenshots'].getProcessing();
    this.idInterval = setInterval(async () => {
      // Полчить сайты для обработки
      if (!this.sites.length) {
        this.sites = await db['sites-screenshots'].getProcessing();
      } else {
        if (!this.isProcessing) {
          let { url, id } = this.sites[this.sites.length - 1];
          await this.createScreenshot({ url, siteScreenshotId: id });
        }
      }
    }, 2000);
  }

  stop() {
    clearInterval(this.idInterval);
  }

  // Сделать скриншот сайта
  async createScreenshot({ url, siteScreenshotId }) {
    let browser;
    let page;

    try {
      this.isProcessing = true;
      browser = await puppeteer.launch({
        args: ['--lang=uk-UA,uk', '--no-sandbox'],
      });
      page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'uk',
      });

      await page.setDefaultNavigationTimeout(60000);

      await page.setViewport({
        width: 1600,
        height: 900,
      });
      await page.setUserAgent(this.userAgent);
      await page.goto(url);
      await page.screenshot({
        path: config.setSiteScreenAssets(siteScreenshotId),
        type: 'png',
      });
      // Указывает на то что скриншот создан
      await db['sites-screenshots'].editProcessing({
        id: siteScreenshotId,
        isProcessed: true,
        isCreatedScreen: true,
      });
    } catch (error) {
      // Указывает на то что при создании скрина произошла ошибка
      await db['sites-screenshots'].editProcessing({
        id: siteScreenshotId,
        isError: true,
        isCreatedScreen: false,
        isProcessed: true,
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

  async getReadyScreenshotsForRating(params = {}) {
    let result = await db['sites-screenshots'].getReadyScreenshotsForRating(params);
    return result;
  }
}

module.exports = SitesScreenshots;
