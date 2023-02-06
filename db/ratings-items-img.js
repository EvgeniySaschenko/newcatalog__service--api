let { M_RatingsItemsImg } = require(global.ROOT_PATH + '/models/ratings-items-img.js');

module.exports = {
  // Создать запись для новой картинки (если такого домена никогда еще небыло)
  async createImg({ host }) {
    let result = await M_RatingsItemsImg.create({ host });
    return result.get({ plain: true });
  },

  // Обновить информацию о картинке
  async updateImg({ id, color, name }) {
    let result = await M_RatingsItemsImg.update(
      {
        name,
        color,
      },
      { where: { id } }
    );
    return result[0];
  },

  // Получить запись о картинке по "host"
  async getImgByHost({ host }) {
    return await M_RatingsItemsImg.findOne({
      attributes: ['id', 'name'],
      where: {
        host,
      },
    });
  },
};
