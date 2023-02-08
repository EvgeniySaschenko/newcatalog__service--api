let { M_SitesScreenshots } = require(global.ROOT_PATH + '/models/sites-screenshots.js');
let config = require(global.ROOT_PATH + '/env.config');

module.exports = {
  // Добавить елемент в очередь на создание скрина
  async addScreenProcessing({ ratingId, url, siteId, host }) {
    let result = await M_SitesScreenshots.create({
      ratingId,
      url,
      siteId,
      host,
    });
    return result.get({ plain: true });
  },

  // Записать данные о состоянии процесса
  /* 
    isCreatedScreen - параметр нужен при редактировании сайтой - чтобы не поставить в обработку пока не готово лого 
  */
  async editProcessing(params = {}) {
    let validFields = {
      isProcessed: true,
      isCreatedScreen: true,
      isError: true,
      isCreatedLogo: true,
      errorMessage: true,
    };

    let queryParams = {};

    for (let key in params) {
      if (key in validFields) {
        queryParams[key] = params[key];
      }
    }

    await M_SitesScreenshots.update(
      { ...queryParams },
      {
        where: {
          siteScreenshotId: params.siteScreenshotId,
        },
      }
    );
  },

  // Получить сайты которые необходимо обработать (isError - сайты у котрых появилась ошибка при обработке)
  async getProcessing() {
    let result = await M_SitesScreenshots.findAll({
      attributes: ['siteScreenshotId', 'url'],
      where: {
        isCreatedScreen: false,
        isProcessed: true,
        isError: false,
      },
      order: [['dateCreate', 'ASC']],
    });
    return result || [];
  },

  // Получить елемент в который находится в обработке
  async getScreenProcessingByHost({ host }) {
    let result = await M_SitesScreenshots.findOne({
      attributes: ['siteScreenshotId', 'siteId'],
      where: {
        host,
        isProcessed: true,
      },
    });

    return result;
  },

  // Получить скриншот по id
  async getScreenById({ siteScreenshotId }) {
    let result = await M_SitesScreenshots.findOne({
      attributes: ['siteId'],
      where: { siteScreenshotId },
    });
    return result;
  },

  async getReadyScreenshotsForRating({
    ratingId,
    isCreatedScreen = true,
    isProcessed = true,
    isСanceled = false,
    isError = false,
  }) {
    let result = await M_SitesScreenshots.findAll({
      attributes: ['siteScreenshotId'],
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
      el.img = config.setSiteScreenUrl(el.siteScreenshotId);
      return el;
    });
  },
};
