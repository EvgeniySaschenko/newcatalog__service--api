let { M_ScreenshotsSites } = require(global.ROOT_PATH + '/models/screenshots-sites.js');
let config = require(global.ROOT_PATH + '/env.config');

module.exports = {
  // Добавить елемент в очередь на создание скрина
  async addScreenProcessing({ ratingId, url, imgId, host }) {
    let result = await M_ScreenshotsSites.create({
      ratingId,
      url,
      imgId,
      host,
    });
    return result.get({ plain: true });
  },

  // Записать данные о состоянии процесса
  /* 
    isCreatedScreen - параметр нужен при редактировании сайтой - чтобы не поставить в обработку пока не готово лого 
  */
  async editScreenProcessing(params = {}) {
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

    await M_ScreenshotsSites.update(
      { ...queryParams },
      {
        where: {
          id: params.id,
        },
      }
    );
  },

  // Получить сайты которые необходимо обработать (isError - сайты у котрых появилась ошибка при обработке)
  async getScreensProcessing() {
    let result = await M_ScreenshotsSites.findAll({
      attributes: ['id', 'url'],
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
    let result = await M_ScreenshotsSites.findOne({
      attributes: ['id', 'imgId'],
      where: {
        host,
        isProcessed: true,
      },
    });

    return result;
  },

  // Получить скриншот по id
  async getScreenById({ id }) {
    let result = await M_ScreenshotsSites.findOne({
      attributes: ['imgId'],
      where: { id },
    });
    return result;
  },

  async getReadyScreensSitesForRating({
    ratingId,
    isCreatedScreen = true,
    isProcessed = true,
    isСanceled = false,
    isError = false,
  }) {
    let result = await M_ScreenshotsSites.findAll({
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
  },
};
