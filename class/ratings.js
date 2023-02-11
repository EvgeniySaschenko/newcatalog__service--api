let plugins = require(global.ROOT_PATH + '/plugins');
let fse = require('fs-extra');

class Ratings {
  // Создать рейтинг
  async createRating(rating = {}) {
    return await plugins['db-main'].ratings.createRating(rating);
  }

  // Редактировать рейтинг
  async editRating(rating = {}) {
    return await plugins['db-main'].ratings.editRating(rating);
  }

  // Получить рейтинг
  async getRating({ ratingId }) {
    return await plugins['db-main'].ratings.getRating({ ratingId });
  }

  // Получить все рейтинги пользователя
  async getRatingsUser({ userId }) {
    return await plugins['db-main'].ratings.getRatingsUser({ userId });
  }

  // Создать кеш для прода
  async createCache() {
    let ratings = await plugins['db-main'].ratings.getRatingsNotHidden();
    fse.writeJson(global.ROOT_PATH + '/cashe/ratings.json', ratings);
  }
}

module.exports = Ratings;
