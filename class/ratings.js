let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

class Ratings {
  // Создать рейтинг
  async createRating({
    token,
    name,
    descr,
    typeRating,
    typeSort,
    typeDisplay,
    sectionsIds,
    isHiden,
  }) {
    let { userId } = await $utils['user'].getTokenData({ token });

    return await $dbMain['ratings'].createRating({
      userId,
      name,
      descr,
      typeRating,
      typeSort,
      typeDisplay,
      sectionsIds,
      isHiden,
    });
  }

  // Редактировать рейтинг
  async editRating({
    token,
    ratingId,
    name,
    descr,
    isHiden,
    typeRating,
    typeSort,
    typeDisplay,
    sectionsIds,
    visitorId,
  }) {
    let { userId } = await $utils['user'].getTokenData({ token });
    return await $dbMain['ratings'].editRating({
      userId,
      ratingId,
      name,
      descr,
      isHiden,
      typeRating,
      typeSort,
      typeDisplay,
      sectionsIds,
      visitorId,
    });
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

  // Получить рейтинги
  async getRatings() {
    return await $dbMain['ratings'].getRatings();
  }

  // Удалить рейтинг
  async deleteRating({ ratingId }) {
    let ratingItems = await $dbMain['ratings-items'].getItemsRating({ ratingId });
    let ratingLabels = await $dbMain['labels'].getLabelsRating({ ratingId });
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
