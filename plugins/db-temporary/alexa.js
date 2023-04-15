let { createClient } = require('redis');
let fse = require('fs-extra');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { DB_TEMPORARY__HOST, DB_TEMPORARY__DB_ALEXA, DB_TEMPORARY__DB_ALEXA_PREFIXES } = process.env;
const client = createClient({
  url: `${DB_TEMPORARY__HOST}/${DB_TEMPORARY__DB_ALEXA}`,
});

client.on('error', async (err) => {
  console.error('Redis content "ALEXA"', err);
  await client.quit();
  await client.connect();
});

client.connect();

let prefixes = JSON.parse(DB_TEMPORARY__DB_ALEXA_PREFIXES);

module.exports = {
  // Create database AlexaRank
  async createDataDaseCacheAlexaRank() {
    let isAlexaRankData = await client.get(prefixes['is-alexa-rank-data']);
    if (!isAlexaRankData) {
      let fileContent = fse.readFileSync($utils['paths'].filePathAlexaRank(), 'utf8');
      for (let item of fileContent.split('\n')) {
        let [rank, host] = item.split(',');
        await client.set(`${prefixes['alexa-rank']}_${host}`, rank);
      }
      await client.set(prefixes['is-alexa-rank-data'], 'true');
    }
  },

  // Get AlexaRank
  async getAlexaRank(domain) {
    try {
      let alexaRank = await client.get(`${prefixes['alexa-rank']}_${domain}`);
      return Number(alexaRank) || null;
    } catch (error) {
      // Even if there is an error, this data is not critical.
      console.error(error);
    }
    return null;
  },
};
