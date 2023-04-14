let { createClient } = require('redis');
let { DB_TEMPORARY__HOST, DB_TEMPORARY__DB_API, DB_TEMPORARY__DB_API_PREFIXES } = process.env;
let dbTemporaryPrefixes = JSON.parse(DB_TEMPORARY__DB_API_PREFIXES);

const client = createClient({
  url: `${DB_TEMPORARY__HOST}/${DB_TEMPORARY__DB_API}`,
});

client.on('error', (err) => {
  console.error('Redis Settings Error', err);
  client.quit();
});

module.exports = {
  // Add token
  async addTokenUserSecretKey(secretKey) {
    try {
      await client.connect();
      await client.set(dbTemporaryPrefixes['token-user-secret-key'], secretKey);
      await client.quit();
    } catch (error) {
      await client.quit();
      throw error;
    }
  },

  // Get token
  async getTokenUserSecretKey() {
    try {
      await client.connect();
      let result = await client.get(dbTemporaryPrefixes['token-user-secret-key']);
      await client.quit();
      return result || null;
    } catch (error) {
      await client.quit();
      throw error;
    }
  },
};
