let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

class Ratings {
  // Create Rating
  async createRating({
    userId,
    name,
    descr,
    typeRating,
    typeSort,
    typeDisplay,
    sectionsIds,
    isHiden,
  }) {
    let { ratingId } = await $dbMain['ratings'].createRating({
      userId,
      name,
      descr,
      typeRating,
      typeSort,
      typeDisplay,
      sectionsIds,
      isHiden,
    });

    return { ratingId };
  }

  // Edit Rating
  async editRating({
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
  }) {
    let result = await $dbMain['ratings'].editRating({
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

    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Get Rating
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

  // Get Ratings
  async getRatings() {
    return await $dbMain['ratings'].getRatings();
  }

  // Delete Rating
  async deleteRating({ ratingId }) {
    let ratingItems = await $dbMain['ratings-items'].getItemsRating({ ratingId });
    let ratingLabels = await $dbMain['labels'].getLabelsRating({ ratingId });
    if (ratingItems.length || ratingLabels.length) {
      $utils['errors'].validationMessage({
        path: 'rating',
        message: $t('You can not remove a rating that has sites or labels'),
      });
    }

    let tableRecord = await $dbMain['ratings'].getRating({ ratingId });
    await $dbMain['records-deleted'].createRecords({
      tableName: $dbMain['ratings'].tableName,
      tableId: ratingId,
      tableRecord,
    });
    let result = await $dbMain['ratings'].deleteRating({ ratingId });
    if (!result) $utils['errors'].serverMessage();
    return true;
  }
}

module.exports = Ratings;
