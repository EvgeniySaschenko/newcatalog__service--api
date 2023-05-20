let { name: tableName } = require('./models/ratings');
let { Op } = require('sequelize');
let { $dbMainConnect } = require('./models/_db');

module.exports = {
  tableName,
  // Create rating
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
    let result = await $dbMainConnect.models['ratings'].create({
      userId,
      name,
      descr,
      linksToSources,
      typeRating,
      typeSort,
      typeDisplay,
      sectionsIds,
      isHiden,
    });

    return result.get({ plain: true });
  },

  // Edit rating
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
    let result = await $dbMainConnect.models['ratings'].update(
      {
        name,
        descr,
        linksToSources,
        isHiden,
        typeRating,
        typeSort,
        typeDisplay,
        sectionsIds,
        visitorId,
      },
      {
        where: { ratingId, userId },
      }
    );
    return result[0];
  },

  // Get rating
  async getRating({ ratingId }) {
    let result = await $dbMainConnect.models['ratings'].findOne({
      where: {
        ratingId,
      },
    });
    return result;
  },

  // Get rating count
  async getRatingCount() {
    let result = await $dbMainConnect.models['ratings'].count({});
    return result;
  },

  // Get the number of ratings in a section
  async getRatingCountBySectionId({ sectionId }) {
    let result = await $dbMainConnect.models['ratings'].count({
      where: {
        sectionsIds: {
          [sectionId]: sectionId,
        },
      },
    });
    return result;
  },

  // Get the number of published ratings in a section
  async getRatingPublishedCountBySectionId({ sectionId }) {
    let result = await $dbMainConnect.models['ratings'].count({
      where: {
        sectionsIds: {
          [sectionId]: sectionId,
        },
        dateCacheCreation: {
          [Op.ne]: null,
        },
      },
    });
    return result;
  },

  // Get all ratings
  async getRatings({ offset, limit }) {
    let result = await $dbMainConnect.models['ratings'].findAll({
      order: [
        ['dateCreate', 'DESC'],
        ['dateFirstPublication', 'DESC'],
      ],
      offset,
      limit,
    });
    return result;
  },

  // Delete rating
  async deleteRating({ ratingId }) {
    return await $dbMainConnect.models['ratings'].destroy({ where: { ratingId } });
  },

  // Set the date of the first publication (determines the sequence of output on the site)
  async editDateFirstPublication({ ratingId }) {
    let result = await $dbMainConnect.models['ratings'].update(
      {
        dateFirstPublication: new Date(),
      },
      {
        where: { ratingId },
      }
    );
    return result[0];
  },
  // Cache creation date
  async editCacheCreation({ ratingId, dateCacheCreation, sectionsIdsCache }) {
    let result = await $dbMainConnect.models['ratings'].update(
      {
        dateCacheCreation,
        sectionsIdsCache,
      },
      {
        where: { ratingId },
      }
    );
    return result[0];
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {
    let all = await $dbMainConnect.models['ratings'].findAll();

    for await (let item of all) {
      let ua = item.descr['ua'];
      item.descr['uk'] = ua;
      delete item.descr['ua'];
      await $dbMainConnect.models['ratings'].update(
        { descr: item.descr },
        { where: { ratingId: item.ratingId } }
      );
    }
  },
};
