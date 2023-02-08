let { M_Sites } = require(global.ROOT_PATH + '/models/sites.js');

module.exports = {
  // Создать запись для новой картинки (если такого домена никогда еще небыло)
  async createSite({ host }) {
    let result = await M_Sites.create({ host });
    return result.get({ plain: true });
  },

  // Обновить информацию о картинке
  async updateSite({ siteId, color, siteScreenshotId }) {
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
};
