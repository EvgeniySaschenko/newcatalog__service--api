let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let striptags = require('striptags');

class Ratings {
  // Create Rating
  async createRating({
    userId,
    name,
    descr,
    linksToSources,
    typeRating,
    typeSort,
    typeDisplay,
    sectionsIds,
    isHiden,
  }) {
    let data = this.prepareRatingData({ name, descr, linksToSources });

    let { ratingId } = await $dbMain['ratings'].createRating({
      userId,
      name: data.name,
      descr: data.descr,
      linksToSources: data.linksToSources,
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
    linksToSources,
    isHiden,
    typeRating,
    typeSort,
    typeDisplay,
    sectionsIds,
    visitorId,
  }) {
    let data = this.prepareRatingData({ name, descr, linksToSources });

    let result = await $dbMain['ratings'].editRating({
      userId,
      ratingId,
      name: data.name,
      descr: data.descr,
      linksToSources: data.linksToSources,
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

  // Prepare rating data
  prepareRatingData({ name, descr, linksToSources }) {
    let linksUnic = {};
    for (let key in name) {
      name[key] = striptags(name[key]);
      descr[key] = striptags(descr[key]);
    }

    if (Array.isArray(linksToSources)) {
      for (let item of linksToSources) {
        linksUnic[item] = item;
      }
      linksToSources = Object.keys(linksUnic).sort();
    }

    return {
      name,
      descr,
      linksToSources,
    };
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

  // Get ratings
  async getRatings({ maxRecordsPerPage = global.$config['common'].maxRecordsPerPage, page = 1 }) {
    let offset = (page - 1) * maxRecordsPerPage;
    let count = await $dbMain['ratings'].getRatingCount();
    let ratings = await $dbMain['ratings'].getRatings({
      offset,
      limit: maxRecordsPerPage,
    });

    let pagesCount = Math.ceil(count / maxRecordsPerPage);

    return {
      page,
      pagesCount,
      maxRecordsPerPage,
      itemsCount: count,
      items: ratings,
    };
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
