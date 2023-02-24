let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let lodash = require('lodash');

class CacheInfo {
  async runCacheCreate() {
    let dateStart = new Date();
    let dateLastCache = '1970-01-01';
    let cacheInfo = await $dbMain['cache-info'].getLastRecord();
    if (cacheInfo) {
      dateLastCache = cacheInfo.dateStartCreate;
    }
    let sections = await $dbMain['sections'].getSections();
    await this.getRatingsIds(dateLastCache);

    //await $dbMain['cache-info'].createItem({ tablesIds, dateStartCreate });
  }

  async getRatingsIds(dateLastCache) {
    let labels = await $dbMain['labels'].getRatingIdsAfterDateUpdate({ date: dateLastCache });
    let ratings = await $dbMain['ratings'].getRatingIdsAfterDateUpdate({ date: dateLastCache });
    let ratingsItems = await $dbMain['ratings-items'].getRatingIdsAfterDateUpdate({
      date: dateLastCache,
    });

    // let sites = await $dbMain['sites'].getRatingIdsAfterDateUpdate({ date: dateLastCache });
    // console.log(sites);
    let unicRatingId = lodash.unionBy(labels, ratings, ratingsItems, 'ratingId');
    //console.log(unicRatingId);
  }
}

module.exports = CacheInfo;
