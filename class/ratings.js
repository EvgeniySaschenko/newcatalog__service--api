let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');

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
    let rating = await $dbMain['ratings'].getRating({ ratingId });
    let countRatingItemsVisible = await $dbMain['ratings-items'].getCountItemsRatingByIsHiden({
      ratingId,
      isHiden: false,
    });
    let countRatingItemsHidden = await $dbMain['ratings-items'].getCountItemsRatingByIsHiden({
      ratingId,
      isHiden: true,
    });
    rating.countRatingItemsTotal = countRatingItemsVisible + countRatingItemsHidden;
    rating.countRatingItemsHidden = countRatingItemsHidden;
    return rating;
  }

  // Получить все рейтинги
  async getRatings() {
    return await $dbMain['ratings'].getRatings();
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
}

module.exports = Ratings;
