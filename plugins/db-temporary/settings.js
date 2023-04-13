let { createClient } = require('redis');
let { DB_TEMPORARY__HOST, DB_TEMPORARY__DB_SETTINGS } = process.env;

const client = createClient({
  url: `${DB_TEMPORARY__HOST}/${DB_TEMPORARY__DB_SETTINGS}`,
});

client.on('error', (err) => {
  console.error('Redis Settings Error', err);
  client.quit();
});

module.exports = {
  serviceApiToken: 'service-api-token-secret-key',
  // Add token
  async addServiceApiTokenSecretKey(key) {
    await client.connect();
    await client.set(this.serviceApiToken, key);
    await client.quit();
  },

  // Get token
  async getServiceApiTokenSecretKey() {
    try {
      await client.connect();
      let result = await client.get(this.serviceApiToken);
      await client.quit();
      return result || null;
    } catch (error) {
      await client.quit();
      throw error;
    }
  },
};
