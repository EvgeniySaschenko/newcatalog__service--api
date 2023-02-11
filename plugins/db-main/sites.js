let { Op } = require('sequelize');
let { M_Sites } = require(global.ROOT_PATH + '/models/sites.js');

module.exports = {
  // Создать запись для новой картинки (если такого домена никогда еще небыло)
  async createSite({ host }) {
    let result = await M_Sites.create({ host });
    return result.get({ plain: true });
  },

  // Обновить информацию о картинке
  async updateLogoInfo({ siteId, color, siteScreenshotId }) {
    let result = await M_Sites.update(
      {
        siteScreenshotId,
        color,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  // Получить запись о картинке по "host"
  async getSiteByHost({ host }) {
    return await M_Sites.findOne({
      attributes: ['siteId', 'siteScreenshotId'],
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
