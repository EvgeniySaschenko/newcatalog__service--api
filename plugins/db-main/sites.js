let { Op } = require('sequelize');
let { M_Sites } = require(global.ROOT_PATH + '/models/sites.js');
let striptags = require('striptags');

module.exports = {
  // Создать запись для новой картинки (если такого домена никогда еще небыло)
  async createSite({ host }) {
    let result = await M_Sites.create({ host });
    return result.get({ plain: true });
  },

  // Обновить информацию о логотипе
  async updateLogoInfo({ color, siteScreenshotId }) {
    let result = await M_Sites.update(
      {
        siteLogoId: siteScreenshotId,
        color: color ? striptags(color).toLocaleLowerCase() : null,
      },
      { where: { siteScreenshotId } }
    );
    return result[0];
  },

  // Редактировать цвет сайтов
  async editSitesColor({ siteScreenshotId, color }) {
    let result = await M_Sites.update(
      {
        color: color ? striptags(color).toLocaleLowerCase() : null,
      },
      { where: { siteLogoId: siteScreenshotId } }
    );
    return result[0];
  },

  // Обновить информацию о скриншоте
  async updateScreenshotInfo({ siteId, siteScreenshotId }) {
    let result = await M_Sites.update(
      {
        siteScreenshotId,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  // Обновить информацию об изображении полностью
  async updateImageInfo({ siteId, color, siteScreenshotId, siteLogoId }) {
    let result = await M_Sites.update(
      {
        color: color ? striptags(color).toLocaleLowerCase() : null,
        siteScreenshotId,
        siteLogoId,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  // Remove screenshot id, to take a new screenshot
  async removeScreenshotInfo({ siteId }) {
    let result = await M_Sites.update(
      {
        siteScreenshotId: null,
        siteLogoId: null,
        color: null,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  // Remove logo id, to take a new logo
  async removeLogoInfo({ siteId }) {
    let result = await M_Sites.update(
      {
        siteLogoId: null,
        color: null,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  // Получить запись о картинке по "siteId"
  async getSiteBySiteId({ siteId }) {
    return await M_Sites.findOne({
      attributes: ['siteId', 'siteScreenshotId', 'siteLogoId', 'color'],
      where: {
        siteId,
      },
    });
  },

  // Получить запись о картинке по "host"
  async getSiteByHost({ host }) {
    return await M_Sites.findOne({
      attributes: ['siteId', 'siteScreenshotId', 'siteLogoId', 'color'],
      where: {
        host,
      },
    });
  },

  // Получить сайты где нет Alexa Rank (используется для добавления Alexa Rank / даты регистрации домена)
  async getSitesAlexaRankEmpty() {
    return await M_Sites.findAll({
      attributes: ['siteId', 'host'],
      where: {
        alexaRank: {
          [Op.is]: null,
        },
      },
      order: [['dateCreate', 'DESC']],
    });
  },

  // Обновить информацию о картинке
  async updateDomainAndAlexaInfo({ siteId, alexaRank, dateDomainCreate }) {
    let result = await M_Sites.update(
      {
        alexaRank,
        dateDomainCreate,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  async getSitesDateDomainCreateEmpty() {
    return await M_Sites.findAll({
      attributes: ['siteId', 'host'],
      where: {
        dateDomainCreate: null,
      },
      order: [['dateCreate', 'DESC']],
    });
  },

  async updateSitesDateDomainCreateEmpty({ dateDomainCreate, siteId }) {
    await M_Sites.update(
      {
        dateDomainCreate,
      },
      { where: { siteId } }
    );
  },
};
