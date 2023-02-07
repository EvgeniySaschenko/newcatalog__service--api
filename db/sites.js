let { M_Sites } = require(global.ROOT_PATH + '/models/sites.js');

module.exports = {
  // Создать запись для новой картинки (если такого домена никогда еще небыло)
  async createSite({ host }) {
    let result = await M_Sites.create({ host });
    return result.get({ plain: true });
  },

  // Обновить информацию о картинке
  async updateSite({ id, color, siteScreenshotId }) {
    let result = await M_Sites.update(
      {
        siteScreenshotId,
        color,
      },
      { where: { id } }
    );
    return result[0];
  },

  // Получить запись о картинке по "host"
  async getSiteByHost({ host }) {
    return await M_Sites.findOne({
      attributes: ['id', 'siteScreenshotId'],
      where: {
        host,
      },
    });
  },

  // async updateSiteScreenshotId() {
  //   let sites = await M_Sites.findAll({
  //     attributes: ['id', 'siteScreenshotId'],
  //   });
  //   console.log(sites);
  //   for await (let item of sites) {
  //     await M_Sites.update(
  //       {
  //         siteScreenshotId2: +item.siteScreenshotId || 0,
  //       },
  //       { where: { id: item.id } }
  //     );
  //   }
  // },

  // Обновить информацию о картинке
  // async updateSiteAlexaRank({ alexaRank, siteId }) {
  //   let result = await M_Sites.update(
  //     {
  //       alexaRank,
  //     },
  //     { where: { id: siteId } }
  //   );
  //   return result[0];
  // },
};
