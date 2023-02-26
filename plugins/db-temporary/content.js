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
  prefixSections: 'sections',

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
      let rating = await client.get(`${this.prefixRating}_${ratingId}`);
      await client.quit();
      return rating ? JSON.parse(rating) : false;
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

  // Add sections
  async addSections({ sections }) {
    try {
      await client.connect();
      await client.set(this.prefixSections, JSON.stringify(sections));
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
      let sections = await client.get(this.prefixSections);
      await client.quit();
      return sections ? JSON.parse(sections) : false;
    } catch (error) {
      client.quit();
      console.error(error);
    }
    return false;
  },

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

  // Get count keys
  async getCountKeys() {
    try {
      await client.connect();
      let countKeys = await client.dbSize();
      client.quit();
      return countKeys;
    } catch (error) {
      client.quit();
      console.error(error);
      throw error;
    }
  },
};
