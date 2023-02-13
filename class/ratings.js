let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let fse = require('fs-extra');

class Ratings {
  // Создать рейтинг
  async createRating(rating = {}) {
    return await $dbMain.ratings.createRating(rating);
  }

  // Редактировать рейтинг
  async editRating(rating = {}) {
    return await $dbMain.ratings.editRating(rating);
  }

  // Получить рейтинг
  async getRating({ ratingId }) {
    return await $dbMain.ratings.getRating({ ratingId });
  }

  // Получить все рейтинги пользователя
  async getRatingsUser({ userId }) {
    return await $dbMain.ratings.getRatingsUser({ userId });
  }

  // Создать кеш для прода
  async createCache() {
    let ratings = await $dbMain.ratings.getRatingsNotHidden();
    fse.writeJson(global.ROOT_PATH + '/cashe/ratings.json', ratings);
  }
}

module.exports = Ratings;
