let { createClient } = require('redis');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { DB_TEMPORARY__HOST } = process.env;
let client = createClient({
  url: `${DB_TEMPORARY__HOST}/${$config['db-temporary'].content}`,
});
client.on('error', (err) => {
  console.error('Redis Content Error', err);
  client.quit();
});

module.exports = {
  prefixRating: 'rating',
  prefixRatingItems: 'rating-items',
  prefixLabels: 'labels',
  prefixSections: 'sections',
  prefixSectionRatings: 'section-ratings',
  prefixRatingsList: 'ratings-list',

  /* RATING */

  // Add rating
  async addRating({ ratingId, data }) {
    try {
      await client.connect();
      await client.set(`${this.prefixRating}_${ratingId}`, JSON.stringify(data));
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  // Get rating
  async getRating({ ratingId }) {
    try {
      await client.connect();
      let result = await client.get(`${this.prefixRating}_${ratingId}`);
      await client.quit();
      return result ? JSON.parse(result) : false;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  // Delete rating
  async deleteRating({ ratingId }) {
    try {
      await client.connect();
      await client.del(`${this.prefixRating}_${ratingId}`);
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  /* RATING ITEMS */

  // Add rating
  async addRatingItems({ ratingId, data }) {
    try {
      await client.connect();
      await client.set(`${this.prefixRatingItems}_${ratingId}`, JSON.stringify(data));
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  // Get rating
  async getRatingItems({ ratingId }) {
    try {
      await client.connect();
      let result = await client.get(`${this.prefixRatingItems}_${ratingId}`);
      await client.quit();
      return result ? JSON.parse(result) : false;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  // Delete rating
  async deleteRatingItems({ ratingId }) {
    try {
      await client.connect();
      await client.del(`${this.prefixRatingItems}_${ratingId}`);
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  /* LABELS */

  // Add labels
  async addLabels({ ratingId, data }) {
    try {
      await client.connect();
      await client.set(`${this.prefixLabels}_${ratingId}`, JSON.stringify(data));
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  // Get labels
  async getLabels({ ratingId }) {
    try {
      await client.connect();
      let result = await client.get(`${this.prefixLabels}_${ratingId}`);
      await client.quit();
      return result ? JSON.parse(result) : false;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  // Delete labels
  async deleteLabels({ ratingId }) {
    try {
      await client.connect();
      await client.del(`${this.prefixLabels}_${ratingId}`);
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  /* SECTIONS */

  // Add sections
  async addSections({ data }) {
    try {
      await client.connect();
      await client.set(this.prefixSections, JSON.stringify(data));
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  // Get sections
  async getSections() {
    try {
      await client.connect();
      let result = await client.get(this.prefixSections);
      await client.quit();
      return result ? JSON.parse(result) : false;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  /* RATINGS LIST */

  // Add ratings list ids
  async addRatingsListIds({ data }) {
    try {
      await client.connect();
      await client.set(this.prefixRatingsList, JSON.stringify(data));
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  // Get ratings list ids
  async getRatingsListIds() {
    try {
      await client.connect();
      let result = await client.get(this.prefixRatingsList);
      await client.quit();
      return result ? JSON.parse(result) : false;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  /* SECTIONS RATINGS  LIST */

  // Get section ratings ids
  async getSectionRatingsListIds({ sectionId }) {
    try {
      await client.connect();
      let result = await client.get(`${this.prefixSectionRatings}_${sectionId}`);
      await client.quit();
      return result ? JSON.parse(result) : false;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  // Add section ratings ids
  async addSectionRatingsListIds({ sectionId, data }) {
    try {
      await client.connect();
      await client.set(`${this.prefixSectionRatings}_${sectionId}`, JSON.stringify(data));
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

  /* OHER */

  // Clear db
  async clearDatabase() {
    try {
      await client.connect();
      await client.flushDb('ASYNC', function (error, succeeded) {
        if (error) throw error;
      });
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
      if (error) throw error;
    }
  },
};
