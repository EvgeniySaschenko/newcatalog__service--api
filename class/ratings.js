let db = require(global.ROOT_PATH + '/db');
let fse = require('fs-extra');

class Ratings {
  // Создать рейтинг
  async createRating(rating = {}) {
    return await db.ratings.createRating(rating);
  }

  // Редактировать рейтинг
  async editRating(rating = {}) {
    return await db.ratings.editRating(rating);
  }

  // Получить рейтинг
  async getRating({ id }) {
    return await db.ratings.getRating({ id });
  }

  // Получить все рейтинги пользователя
  async getRatingsUser({ userId }) {
    return await db.ratings.getRatingsUser({ userId });
  }

  // Создать кеш для прода
  async createCache() {
    let ratings = await db.ratings.getRatingsNotHidden();
    fse.writeJson(global.ROOT_PATH + '/cashe/ratings.json', ratings);
  }
}

module.exports = Ratings;
