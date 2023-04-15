let { createClient } = require('redis');
let { DB_TEMPORARY__HOST, DB_TEMPORARY__DB_API, DB_TEMPORARY__DB_API_PREFIXES } = process.env;
let dbTemporaryPrefixes = JSON.parse(DB_TEMPORARY__DB_API_PREFIXES);

const client = createClient({
  url: `${DB_TEMPORARY__HOST}/${DB_TEMPORARY__DB_API}`,
});

client.on('error', async (err) => {
  console.error('Redis content "API"', err);
  await client.quit();
  await client.connect();
});

client.connect();

module.exports = {
  // Add token
  async addTokenUserSecretKey(secretKey) {
    await client.set(dbTemporaryPrefixes['token-user-secret-key'], secretKey);
  },

  // Get token
  async getTokenUserSecretKey() {
    let result = await client.get(dbTemporaryPrefixes['token-user-secret-key']);
    return result || null;
  },
};
