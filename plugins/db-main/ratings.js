let { M_Ratings, name: tableName } = require('./models/ratings');
let striptags = require('striptags');
let { Op } = require('sequelize');

module.exports = {
  tableName,
  // Create rating
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
    for (let key in name) {
      name[key] = striptags(name[key]);
      descr[key] = striptags(descr[key]);
    }

    let result = await M_Ratings.create({
      userId,
      name,
      descr,
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
    isHiden,
    typeRating,
    typeSort,
    typeDisplay,
    sectionsIds,
    visitorId,
  }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
      descr[key] = striptags(descr[key]);
    }

    let result = await M_Ratings.update(
      {
        name,
        descr,
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
    let result = await M_Ratings.findOne({
      where: {
        ratingId,
      },
    });
    return result;
  },

  // Get rating count
  async getRatingCount() {
    let result = await M_Ratings.count({});
    return result;
  },

  // Get the number of ratings in a section
  async getRatingCountBySectionId({ sectionId }) {
    let result = await M_Ratings.count({
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
    let result = await M_Ratings.count({
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
    let result = await M_Ratings.findAll({
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
    return await M_Ratings.destroy({ where: { ratingId } });
  },

  // Set the date of the first publication (determines the sequence of output on the site)
  async editDateFirstPublication({ ratingId }) {
    let result = await M_Ratings.update(
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
    let result = await M_Ratings.update(
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
    let all = await M_Ratings.findAll();

    for await (let item of all) {
      let ua = item.descr['ua'];
      item.descr['uk'] = ua;
      delete item.descr['ua'];
      await M_Ratings.update({ descr: item.descr }, { where: { ratingId: item.ratingId } });
    }
  },
};
