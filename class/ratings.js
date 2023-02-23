let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');
let fse = require('fs-extra');

class Ratings {
  // Создать рейтинг
  async createRating(rating = {}) {
    return await $dbMain['ratings'].createRating(rating);
  }

  // Редактировать рейтинг
  async editRating(rating = {}) {
    return await $dbMain['ratings'].editRating(rating);
  }

  // Получить рейтинг
  async getRating({ ratingId }) {
    return await $dbMain['ratings'].getRating({ ratingId });
  }

  // Получить все рейтинги пользователя
  async getRatingsUser({ userId }) {
    return await $dbMain['ratings'].getRatingsUser({ userId });
  }

  // Удалить рейтинг
  async deleteRating({ ratingId }) {
    let ratingItems = await $dbMain['ratings-items'].getItemsRating({ ratingId });
    let ratingLabels = await $dbMain['labels'].getLabelsRating({ ratingId });
    console.log(ratingItems.length, ratingLabels.length);
    if (ratingItems.length || ratingLabels.length) {
      throw {
        errors: [
          {
            path: 'rating',
            message: $errors['You can not remove a rating that has sites or labels'],
          },
        ],
      };
    }

    let tableRecord = await $dbMain['ratings'].getRating({ ratingId });
    await $dbMain['records-deleted'].createRecords({
      tableName: $dbMain['ratings'].tableName,
      tableId: ratingId,
      tableRecord,
    });
    let result = await $dbMain['ratings'].deleteRating({ ratingId });
    if (result) return true;
  }

  // Создать кеш для прода
  async createCache() {
    let ratings = await $dbMain['ratings'].getRatingsNotHidden();
    fse.writeJson(global.ROOT_PATH + '/cashe/ratings.json', ratings);
  }
}

module.exports = Ratings;
