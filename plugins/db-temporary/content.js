let { createClient } = require('redis');
let { v4: uuidv4 } = require('uuid');
let {
  DB_TEMPORARY__HOST,
  DB_TEMPORARY__PORT_INTERNAL,
  DB_TEMPORARY__DB_CONTENT,
  DB_TEMPORARY__DB_CONTENT_PREFIXES,
} = process.env;
let client = createClient({
  url: `${DB_TEMPORARY__HOST}:${DB_TEMPORARY__PORT_INTERNAL}/${DB_TEMPORARY__DB_CONTENT}`,
});
client.on('error', (err) => {
  console.error('Redis Content Error', err);
  client.quit();
});

let prefixes = JSON.parse(DB_TEMPORARY__DB_CONTENT_PREFIXES);

module.exports = {
  /* RATING */

  // Add rating
  async addRating({ ratingId, data }) {
    try {
      await client.connect();
      await client.set(`${prefixes['rating']}_${ratingId}`, JSON.stringify(data));
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
      let result = await client.get(`${prefixes['rating']}_${ratingId}`);
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
      await client.del(`${prefixes['rating']}_${ratingId}`);
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
      await client.set(`${prefixes['rating-items']}_${ratingId}`, JSON.stringify(data));
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
      let result = await client.get(`${prefixes['rating-items']}_${ratingId}`);
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
      await client.del(`${prefixes['rating-items']}_${ratingId}`);
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
      await client.set(`${prefixes['labels']}_${ratingId}`, JSON.stringify(data));
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
      let result = await client.get(`${prefixes['labels']}_${ratingId}`);
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
      await client.del(`${prefixes['labels']}_${ratingId}`);
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
      await client.set(prefixes['sections'], JSON.stringify(data));
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
      let result = await client.get(prefixes['sections']);
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
      await client.set(prefixes['ratings-list'], JSON.stringify(data));
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
      let result = await client.get(prefixes['ratings-list']);
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
      let result = await client.get(`${prefixes['section-ratings']}_${sectionId}`);
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
      await client.set(`${prefixes['section-ratings']}_${sectionId}`, JSON.stringify(data));
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

  // Set id cache (this label can be used by other services to find out that the cache has changed)
  async setCacheId() {
    try {
      await client.connect();
      await client.set(prefixes['cache-id'], `${Date.now()}_${uuidv4()}`);
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      console.error(error);
      if (error) throw error;
    }
  },
};
