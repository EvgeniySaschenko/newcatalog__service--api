let { createClient } = require('redis');
let fse = require('fs-extra');
let { DB_TEMPORARY__HOST, DB_TEMPORARY__DB_ALEXA, DB_TEMPORARY__DB_ALEXA_PREFIXES } = process.env;
const client = createClient({
  url: `${DB_TEMPORARY__HOST}/${DB_TEMPORARY__DB_ALEXA}`,
});
client.on('error', (err) => {
  console.error('Redis Alexa Error', err);
  client.quit();
});

let prefixes = JSON.parse(DB_TEMPORARY__DB_ALEXA_PREFIXES);

module.exports = {
  // Create database AlexaRank
  async createDataDaseCacheAlexaRank() {
    await client.connect();
    let isAlexaRankData = await client.get('isAlexaRankData');
    if (!isAlexaRankData) {
      let fileContent = fse.readFileSync(global.ROOT_PATH + '/data/alexa-rank.csv', 'utf8');
      for (let item of fileContent.split('\n')) {
        let [rank, host] = item.split(',');
        await client.set(`${prefixes['alexa-rank']}_${host}`, rank);
      }
      await client.set('isAlexaRankData', 'true');
    }
    await client.quit();
  },

  // Get AlexaRank
  async getAlexaRank(domain) {
    try {
      await client.connect();
      let alexaRank = await client.get(`${prefixes['alexa-rank']}_${domain}`);
      await client.quit();
      return Number(alexaRank) || null;
    } catch (error) {
      console.error(error);
    }
    return null;
  },
};
