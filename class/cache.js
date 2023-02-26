let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');
let lodash = require('lodash');
class Cache {
  /*
    Run create caches 
    isCacheReset - Rebuild the entire cache
  */
  async runCacheCreate({ isCacheReset }) {
    let dateStartCreate = new Date();
    let dateCacheLast;
    let cacheCountKeys = await $dbTemporary['content'].getCountKeys();
    let cacheInfo = await $dbMain['cache-info'].getLastRecord();

    if (cacheInfo) {
      dateCacheLast = cacheInfo.dateStartCreate;
    }

    if (!cacheCountKeys || isCacheReset) {
      dateCacheLast = '1970-01-01';
    }

    // Ratings delete
    let ratingIdsDeleted = await this.getRatingsIdsForDelete({ dateCacheLast });
    let infoCacheDeleted = await this.deleteCacheRatings({ ratingIds: ratingIdsDeleted });

    if (infoCacheDeleted.success.length || infoCacheDeleted.errors.length) {
      await $dbMain['cache-info'].createItem({ info: infoCacheDeleted, dateStartCreate });
    }

    // Ratings create
    let ratingIdsCreated = await this.getRatingsIdsForCreate({ dateCacheLast });
    let infoCacheCreated = await this.createCacheRatings({ ratingIds: ratingIdsCreated });

    if (infoCacheCreated.success.length || infoCacheCreated.errors.length) {
      await $dbMain['cache-info'].createItem({ info: infoCacheCreated, dateStartCreate });
    }

    // Sections
    let infoSectionsCreated = await this.createCacheSections();
    await $dbMain['cache-info'].createItem({ info: infoSectionsCreated, dateStartCreate });

    return (
      !infoCacheDeleted.isErrorsContains &&
      !infoCacheCreated.isErrorsContains &&
      !infoSectionsCreated.isErrorsContains
    );
  }

  /*
    Get elements created / updated after "dateCacheLast"
  */
  async getRatingsIdsForCreate({ dateCacheLast }) {
    // updated
    let ratingsUpdated = await $dbMain['ratings'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
      isHiden: false,
    });

    let ratingsItemsUpdated = await $dbMain['ratings-items'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
      isHiden: false,
    });

    let labelsUpdated = await $dbMain['labels'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
    });

    let sitesUpdated = await $dbMain['sites'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
      isHiden: false,
    });

    // deleted
    let ratingsDeleted = await $dbMain['records-deleted'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
      tableName: 'ratings',
    });

    let ratingsItemsDeleted = await $dbMain['records-deleted'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
      tableName: 'ratings_items',
    });

    let labelsDeleted = await $dbMain['records-deleted'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
      tableName: 'labels',
    });

    let unicRatingId = lodash
      .sortBy(
        lodash.unionBy(
          ratingsUpdated,
          ratingsItemsUpdated,
          labelsUpdated,
          sitesUpdated,
          ratingsDeleted,
          ratingsItemsDeleted,
          labelsDeleted,
          'ratingId'
        ),
        'ratingId'
      )
      .filter((el) => el.ratingId);

    return unicRatingId;
  }

  /*
    Get elements (ratings, ratings-items) hidden or deleted after "dateCacheLast"
    If rating hidden of deleted - in this case, the rating should definitely be removed from the cache
    If the rating hides or deletes elements, you need to check if there are visible elements in the rating, if not, this cache needs to be deleted
  */
  async getRatingsIdsForDelete({ dateCacheLast }) {
    // hidden
    let ratingsHidden = await $dbMain['ratings'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
      isHiden: true,
    });

    let ratingsItemsHidden = await $dbMain['ratings-items'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
      isHiden: true,
    });

    // deleted
    let ratingsDeleted = await $dbMain['records-deleted'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
      tableName: 'ratings',
    });

    let ratingsItemsDeleted = await $dbMain['records-deleted'].getItemsForRatingsCache({
      dateInclAndAfter: dateCacheLast,
      tableName: 'ratings_items',
    });

    // Check empty ratings
    let unicRatingsItems = lodash.unionBy(ratingsItemsHidden, ratingsItemsDeleted, 'ratingId');
    let emptyRatings = [];
    for await (let { ratingId } of unicRatingsItems) {
      let count = await $dbMain['ratings-items'].getCountItemsRatingByIsHiden({
        ratingId,
        isHiden: false,
      });

      if (!count) {
        emptyRatings.push({ ratingId });
      }
    }

    let unicRatingId = lodash
      .sortBy(lodash.unionBy(ratingsHidden, ratingsDeleted, emptyRatings, 'ratingId'), 'ratingId')
      .filter((el) => el.ratingId);

    return unicRatingId;
  }

  /*
    Create cache ratings, hidden elements and empty ratings not added
  */
  async createCacheRatings({ ratingIds }) {
    let infoCacheCreated = {
      type: 'ratings',
      operation: 'create',
      success: [],
      errors: [],
      isErrorsContains: false,
    };

    for await (let { ratingId } of ratingIds) {
      // Rating
      let rating = await $dbMain['ratings'].getRating({ ratingId });
      if (!rating || rating.isHiden) continue;

      // Items
      let ratingsItems = await $dbMain['ratings-items'].getItemsRating({
        ratingId,
        typeSort: rating.typeSort,
      });

      ratingsItems = ratingsItems.filter((el) => !el.isHiden);
      if (!ratingsItems.length) continue;

      // Labels
      let labels = await $dbMain['labels'].getLabelsRating({ ratingId });

      rating.labels = labels ? labels : [];
      rating.items = ratingsItems;

      let isSuccesCreated = await $dbTemporary['content'].addRating({ ratingId, data: rating });
      if (isSuccesCreated) {
        infoCacheCreated.success.push(ratingId);
      } else {
        infoCacheCreated.errors.push(ratingId);
        infoCacheCreated.isErrorsContains = true;
      }
    }
    return infoCacheCreated;
  }

  /*
    Delete cache ratings: hidden, deleted, empty
  */
  async deleteCacheRatings({ ratingIds }) {
    let infoCacheDeleted = {
      type: 'ratings',
      operation: 'delete',
      success: [],
      errors: [],
      isErrorsContains: false,
    };

    for await (let { ratingId } of ratingIds) {
      let isSuccesDeleted = await $dbTemporary['content'].deleteRating({ ratingId });
      if (isSuccesDeleted) {
        infoCacheDeleted.success.push(ratingId);
      } else {
        infoCacheDeleted.errors.push(ratingId);
        infoCacheDeleted.isErrorsContains = true;
      }
    }
    return infoCacheDeleted;
  }

  /*
    Create cache sections, hidden not added
  */
  async createCacheSections() {
    let infoCacheCreated = {
      type: 'sections',
      operation: 'create',
      success: [],
      errors: [],
      isErrorsContains: false,
    };
    let sections = await $dbMain['sections'].getSections();
    sections = sections.filter((el) => !el.isHiden);
    let isSuccesCreated = await $dbTemporary['content'].addSections({ sections });
    let sectionIds = sections.map((el) => {
      return { sectionId: el.sectionId };
    });

    if (isSuccesCreated) {
      infoCacheCreated.success = sectionIds;
    } else {
      infoCacheCreated.errors = sectionIds;
      infoCacheCreated.isErrorsContains = true;
    }

    return infoCacheCreated;
  }

  /*
    Clear all cache
  */
  async clearDatabase() {
    return await $dbTemporary['content'].clearDatabase();
  }
}

module.exports = Cache;
