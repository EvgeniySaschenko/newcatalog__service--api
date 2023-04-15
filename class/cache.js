let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');
let { $translations, $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { DB_TEMPORARY__DB_SITE_PREFIXES } = process.env;
let dbTemporaryPrefixes = JSON.parse(DB_TEMPORARY__DB_SITE_PREFIXES);
let { v4: uuidv4 } = require('uuid');

class Cache {
  // Add cache one rating
  async createCacheRating({ ratingId }) {
    // Get datap
    let ratingData = await this.getRatingData({ ratingId });
    if (!ratingData) {
      $utils['errors'].serverMessage(
        $t('There are no items in the rating to publish, or it is hidden')
      );
    }

    // Add to cache
    await this.addRatingToCache(ratingData);

    // Update "dateFirstPublication"
    let dateFirstPublication =
      ratingData.rating.dateFirstPublication || (await this.setDateFirstPublication({ ratingId }));

    // Delete sections change
    await this.deleteSectionsRatingChange({
      sectionsIdsCache: ratingData.rating.sectionsIdsCache,
      sectionsIds: ratingData.rating.sectionsIds,
      ratingIds: [{ ratingId }],
    });

    // Add rating to list
    let ratingsData = [{ ratingId, dateFirstPublication }];
    await this.addRatingsListIds({ ratingsData });

    for await (let sectionId of Object.values(ratingData.rating.sectionsIds)) {
      await this.addSectionRatingsListIds({ sectionId, ratingsData });
    }

    // Update date create cache
    let result = await $dbMain['ratings'].editCacheCreation({
      ratingId,
      dateCacheCreation: new Date(),
      sectionsIdsCache: ratingData.rating.sectionsIds,
    });

    await this.createCacheSections(); // There should be no sections without ratings

    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Get rating related data
  async getRatingData({ ratingId }) {
    let rating = await $dbMain['ratings'].getRating({ ratingId });

    let ratingsItems = (
      await $dbMain['ratings-items'].getItemsRating({
        ratingId,
        typeSort: rating.typeSort,
      })
    ).filter((el) => !el.isHiden);

    let labels = await $dbMain['labels'].getLabelsRating({ ratingId });

    if (rating.isHiden) {
      return false;
    }

    if (!ratingsItems.length) {
      return false;
    }

    return {
      rating,
      ratingsItems,
      labels,
    };
  }

  // Get the list rating in parts (as for pagination) so as not to consume too much memory at the same time
  async getRatingsPartData({ page }) {
    let count = await $dbMain['ratings'].getRatingCount();
    let maxRecordsPerPage = global.$config['ratings'].maxRecordsPerPage;
    let pagesCount = Math.ceil(count / maxRecordsPerPage);
    let offset = (page - 1) * maxRecordsPerPage;

    if (page > pagesCount) return false;

    let ratingsDataList = [];
    let result = await $dbMain['ratings'].getRatings({ offset, limit: maxRecordsPerPage });

    for await (let rating of result) {
      if (rating.isHiden) continue;

      let coutnVisibleItems = await $dbMain['ratings-items'].getCountItemsRatingByIsHiden({
        ratingId: rating.ratingId,
        isHiden: false,
      });

      if (!coutnVisibleItems) continue;

      let data = await this.getRatingData({ ratingId: rating.ratingId });

      if (!data) continue;

      ratingsDataList.push(data);
    }
    return ratingsDataList;
  }

  // Add rating to cache
  async addRatingToCache({ rating, ratingsItems, labels }) {
    let ratingId = rating.ratingId;

    await $dbTemporary['site'].add({
      key: `${dbTemporaryPrefixes['rating']}_${ratingId}`,
      data: {
        ratingId: rating.ratingId,
        name: rating.name,
        descr: rating.descr,
        sectionsIds: rating.sectionsIds,
        dateFirstPublication: rating.dateFirstPublication,
      },
    });

    await $dbTemporary['site'].add({
      key: `${dbTemporaryPrefixes['rating-items']}_${ratingId}`,
      data: ratingsItems.map((el) => {
        return {
          ratingItemId: el.ratingItemId,
          ratingId: el.ratingId,
          siteId: el.siteId,
          url: el.url,
          name: el.name,
          labelsIds: Object.values(el.labelsIds),
          logoImg: el.logoImg,
          hostname: el.hostname,
          color: el.color,
        };
      }),
    });

    await $dbTemporary['site'].add({
      key: `${dbTemporaryPrefixes['labels']}_${ratingId}`,
      data: labels.map((el) => {
        return {
          labelId: el.labelId,
          color: el.color,
          name: el.name,
        };
      }),
    });
  }

  /*
    // Add to cache list all ratings ids
    ratingsData = [{ ratingId, dateFirstPublication }...]
  */
  async addRatingsListIds({ ratingsData }) {
    let ratingsListIds = await $dbTemporary['site'].get({
      key: dbTemporaryPrefixes['ratings-list'],
    });
    if (!ratingsListIds) {
      ratingsListIds = {
        map: {},
        arr: [],
      };
    }

    for (let { ratingId, dateFirstPublication } of ratingsData) {
      ratingsListIds.map[ratingId] = dateFirstPublication.getTime();
    }

    ratingsListIds.arr = Object.entries(ratingsListIds.map)
      .sort((a, b) => {
        return a[1] - b[1];
      })
      .map((el) => el[0]);

    await $dbTemporary['site'].add({
      key: dbTemporaryPrefixes['ratings-list'],
      data: ratingsListIds,
    });
  }

  /*
      Add to cache list all ratings ids from section
      sectionId
      ratingsData = [{ ratingId, dateFirstPublication }...]
    */
  async addSectionRatingsListIds({ sectionId, ratingsData }) {
    let sectionRatingIds = await $dbTemporary['site'].get({
      key: `${dbTemporaryPrefixes['section-ratings']}_${sectionId}`,
    });

    if (!sectionRatingIds) {
      sectionRatingIds = {
        map: {},
        arr: [],
      };
    }

    for (let { ratingId, dateFirstPublication } of ratingsData) {
      sectionRatingIds.map[ratingId] = dateFirstPublication.getTime();
    }

    sectionRatingIds.arr = Object.entries(sectionRatingIds.map)
      .sort((a, b) => {
        return a[1] - b[1];
      })
      .map((el) => el[0]);
    await $dbTemporary['site'].add({
      key: `${dbTemporaryPrefixes['section-ratings']}_${sectionId}`,
      data: sectionRatingIds,
    });
  }

  // Delete cache rating
  async deleteCacheRating({ ratingId }) {
    let rating = await $dbMain['ratings'].getRating({ ratingId });
    await this.deleteRatingFromCache({ ratingIds: [{ ratingId }] });

    await this.deleteSectionsRatingChange({
      sectionsIdsCache: rating.sectionsIdsCache,
      sectionsIds: rating.sectionsIds,
      ratingIds: [{ ratingId }],
    });

    await this.deleteRatingsListIds({ ratingIds: [{ ratingId }] });

    for await (let sectionId of Object.values(rating.sectionsIds)) {
      await this.deleteSectionRatingsListIds({ sectionId, ratingIds: [{ ratingId }] });
    }
    await this.createCacheSections(); // There should be no sections without ratings
    return true;
  }

  // Delete ratings from cache
  async deleteRatingFromCache({ ratingIds }) {
    for await (let { ratingId } of ratingIds) {
      await $dbTemporary['site'].delete({
        key: `${dbTemporaryPrefixes['rating']}_${ratingId}`,
      });
      await $dbTemporary['site'].delete({
        key: `${dbTemporaryPrefixes['rating-items']}_${ratingId}`,
      });
      await $dbTemporary['site'].delete({
        key: `${dbTemporaryPrefixes['labels']}_${ratingId}`,
      });

      await $dbMain['ratings'].editCacheCreation({
        ratingId,
        dateCacheCreation: null,
        sectionsIdsCache: null,
      });
    }
  }

  //  For a list of ratings, remove ratings from the cache
  async deleteRatingsListIds({ ratingIds }) {
    let ratingsListIds = await $dbTemporary['site'].get({
      key: dbTemporaryPrefixes['ratings-list'],
    });
    if (!ratingsListIds) return;

    for (let { ratingId } of ratingIds) {
      delete ratingsListIds.map[ratingId];
    }

    ratingsListIds.arr = Object.entries(ratingsListIds.map)
      .sort((a, b) => {
        return a[1] - b[1];
      })
      .map((el) => el[0]);

    await $dbTemporary['site'].add({
      key: dbTemporaryPrefixes['ratings-list'],
      data: ratingsListIds,
    });
  }

  // From ratings in section, remove ratings
  async deleteSectionRatingsListIds({ sectionId, ratingIds }) {
    let sectionRatingIds = await $dbTemporary['site'].get({
      key: `${dbTemporaryPrefixes['section-ratings']}_${sectionId}`,
    });

    if (!sectionRatingIds) return;

    for (let { ratingId } of ratingIds) {
      delete sectionRatingIds.map[ratingId];
    }

    sectionRatingIds.arr = Object.entries(sectionRatingIds.map)
      .sort((a, b) => {
        return a[1] - b[1];
      })
      .map((el) => el[0]);
    await $dbTemporary['site'].add({
      key: `${dbTemporaryPrefixes['section-ratings']}_${sectionId}`,
      data: sectionRatingIds,
    });
  }

  /*
    Delete rating IDs from sections to which ratings are no longer attached (relative to the previous cache)
  */
  async deleteSectionsRatingChange({ sectionsIdsCache, sectionsIds, ratingIds }) {
    if (!sectionsIdsCache) return;
    for (let sectionId of Object.values(sectionsIdsCache)) {
      if (!sectionsIds[sectionId]) {
        await this.deleteSectionRatingsListIds({ sectionId, ratingIds });
      }
    }
  }

  // Create cache sections
  async createCacheSections() {
    let sections = await $dbMain['sections'].getSections();
    sections = sections.filter((el) => !el.isHiden);
    for await (let item of sections) {
      let countRatingPublished = await $dbMain['ratings'].getRatingPublishedCountBySectionId({
        sectionId: item.sectionId,
      });
      item.countRatingPublished = countRatingPublished;
    }
    sections = sections
      .filter((el) => el.countRatingPublished && !el.isHiden)
      .map((el) => {
        return {
          sectionId: el.sectionId,
          name: el.name,
          countRatingPublished: el.countRatingPublished,
        };
      });

    await $dbTemporary['site'].add({
      key: dbTemporaryPrefixes['sections'],
      data: sections,
    });
    return true;
  }

  // Create cache translations + langs site
  async createCacheTranslationsAndLangsSite() {
    let { serviceName, serviceType } = global.$config['services'].site;
    let translations = {};
    let count = await $dbMain['translations'].getTranslationsCountByType({ serviceType });

    let translationsDb = await $dbMain['translations'].getTranslationsByType({
      serviceType,
      limit: count,
      offset: 0,
    });

    let langs = $translations.getLangs({ serviceName });
    for (let lang of langs) {
      translations[lang] = {};
    }

    if (!translationsDb) return translations;

    for (let { text, key } of translationsDb) {
      for (let lang of langs) {
        translations[lang][key] = text[lang] || '';
      }
    }

    let lang = $translations.getLangDefault({ serviceName });

    await $dbTemporary['site'].add({
      key: dbTemporaryPrefixes['translations-site'],
      data: translations,
    });

    await $dbTemporary['site'].add({
      key: dbTemporaryPrefixes['langs-site'],
      data: langs,
    });

    await $dbTemporary['site'].add({
      key: dbTemporaryPrefixes['lang-default-site'],
      data: lang,
    });

    return true;
  }

  // Create cache from all elements
  async resetCacheAll() {
    await this.clearCacheAll();

    let ratingsDataFromList = [];
    let ratingsDataFromListSections = {};
    let ratingsDataList = [];

    let runPart = async (pageCurrent) => {
      ratingsDataList = await this.getRatingsPartData({ page: pageCurrent });
      if (!ratingsDataList) return;
      for await (let ratingData of ratingsDataList) {
        // Add to cache
        await this.addRatingToCache(ratingData);
        // Update "dateFirstPublication"
        let dateFirstPublication =
          ratingData.rating.dateFirstPublication ||
          (await this.setDateFirstPublication({
            ratingId: ratingData.rating.ratingId,
          }));

        // Update date create cache
        await $dbMain['ratings'].editCacheCreation({
          ratingId: ratingData.rating.ratingId,
          dateCacheCreation: new Date(),
          sectionsIdsCache: ratingData.rating.sectionsIds,
        });

        // ratingsDataFromList
        let data = { ratingId: ratingData.rating.ratingId, dateFirstPublication };
        ratingsDataFromList.push(data);
        // ratingsDataFromListSections
        for (let sectionId in ratingData.rating.sectionsIds) {
          if (!ratingsDataFromListSections[sectionId]) {
            ratingsDataFromListSections[sectionId] = [];
          }
          ratingsDataFromListSections[sectionId].push(data);
        }

        await runPart(pageCurrent + 1);
      }
    };

    await runPart(1);

    if (!ratingsDataFromList.length) return;

    // Add ratings to list
    await this.addRatingsListIds({ ratingsData: ratingsDataFromList });
    for await (let [sectionId, ratingsData] of Object.entries(ratingsDataFromListSections)) {
      await this.addSectionRatingsListIds({ sectionId, ratingsData });
    }

    await this.createCacheSections();
    await this.createCacheTranslationsAndLangsSite();
    return true;
  }

  // Add from rating date first publication
  async setDateFirstPublication({ ratingId }) {
    await $dbMain['ratings'].editDateFirstPublication({ ratingId });
    let rating = await $dbMain['ratings'].getRating({ ratingId });
    return rating.dateFirstPublication;
  }

  // Clear all cache
  async clearCacheAll() {
    let ratingsDataList = [];
    let runPart = async (pageCurrent) => {
      ratingsDataList = await this.getRatingsPartData({ page: pageCurrent });
      if (!ratingsDataList) return;
      for await (let { rating } of ratingsDataList) {
        await $dbMain['ratings'].editCacheCreation({
          ratingId: rating.ratingId,
          dateCacheCreation: null,
          sectionsIdsCache: null,
        });
      }
      await runPart(pageCurrent + 1);
    };
    await runPart(1);
    await $dbTemporary['site'].clearDatabase();
    return true;
  }

  /*
   Set id cache (this label can be used by other services to find out that the cache has changed)
  */
  async setCacheId() {
    await $dbTemporary['site'].add({
      key: dbTemporaryPrefixes['cache-id'],
      data: uuidv4(),
    });
  }

  // Delete id cache (used in cache changes)
  async deleteCacheId() {
    await $dbTemporary['site'].delete({
      key: dbTemporaryPrefixes['cache-id'],
    });
  }
}

module.exports = Cache;
