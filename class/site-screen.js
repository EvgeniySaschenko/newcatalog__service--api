let puppeteer = require('puppeteer');
let { M_ScreensProcessing } = require(global.ROOT_PATH + '/models/screens-processing');
let config = require(global.ROOT_PATH + '/env.config');

class SiteScreen {
  userAgent =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36';
  isProcessing = false;
  sites = [];
  idInterval = null;

  async init() {
    this.sites = await this.getSitesProcessing();
    this.idInterval = setInterval(async () => {
      // Полчить сайты для обработки
      if (!this.sites.length) {
        this.sites = await this.getSitesProcessing();
      } else {
        if (!this.isProcessing) {
          let { url, id } = this.sites[this.sites.length - 1];
          await this.createScreenSite({ url, sitesProcessingId: id });
        }
      }
    }, 2000);
  }

  stop() {
    clearInterval(this.idInterval);
  }

  // Сделать скриншот сайта
  async createScreenSite({ url, sitesProcessingId }) {
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
        path: config.setSiteScreenAssets(sitesProcessingId),
        type: 'png',
      });
      await this.editSiteProcessing({
        id: sitesProcessingId,
        isProcessed: true,
        isCreatedScreen: true,
      });
    } catch (error) {
      await this.editSiteProcessing({
        id: sitesProcessingId,
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

  // Получить сайты которые необходимо обработать (isError - сайты у котрых появилась ошибка при обработке)
  async getSitesProcessing() {
    try {
      let result = await M_ScreensProcessing.findAll({
        attributes: ['id', 'url'],
        where: {
          isCreatedScreen: false,
          isProcessed: true,
          isError: false,
        },
        order: [['dateCreate', 'ASC']],
      });
      return result;
    } catch (error) {
      console.warn(error);
    }
    return [];
  }

  async getReadyScreensSitesForRating({
    ratingId,
    isCreatedScreen = true,
    isProcessed = true,
    isСanceled = false,
    isError = false,
  }) {
    try {
      let result = await M_ScreensProcessing.findAll({
        attributes: ['id'],
        where: {
          isCreatedScreen,
          isProcessed,
          isСanceled,
          isError,
          ratingId,
        },
        order: [['dateCreate', 'ASC']],
      });
      return result.map((el) => {
        el.img = config.setSiteScreenUrl(el.id);
        return el;
      });
    } catch (error) {
      console.warn(error);
    }
    return [];
  }

  // Записать данные о состоянии процесса
  /* 
    isCreatedScreen - параметр нужен при редактировании сайтой - чтобы не поставить в обработку пока не готово лого 
  */
  async editSiteProcessing({
    id,
    isProcessed,
    isCreatedScreen,
    isError = false,
    errorMessage = '',
  }) {
    await M_ScreensProcessing.update(
      { isProcessed, isCreatedScreen, isError, errorMessage },
      {
        where: {
          id,
        },
      }
    );
  }
}

module.exports = SiteScreen;
