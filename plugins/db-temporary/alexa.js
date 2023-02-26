let { createClient } = require('redis');
let fse = require('fs-extra');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { DB_TEMPORARY__HOST } = process.env;
const client = createClient({
  url: `${DB_TEMPORARY__HOST}/${$config['db-temporary'].alexa}`,
});
client.on('error', (err) => {
  console.error('Redis Alexa Error', err);
  client.quit();
});

module.exports = {
  prefixAlexaRank: 'alexa_rank',

  // Create database AlexaRank
  async createDataDaseCasheAlexaRank() {
    await client.connect();
    let isAlexaRankData = await client.get('isAlexaRankData');
    if (!isAlexaRankData) {
      let fileContent = fse.readFileSync(global.ROOT_PATH + '/data/alexa-rank.csv', 'utf8');
      for (let item of fileContent.split('\n')) {
        let [rank, host] = item.split(',');
        await client.set(`${this.prefixAlexaRank}_${host}`, rank);
      }
      await client.set('isAlexaRankData', 'true');
    }
    await client.quit();
  },

  // Get AlexaRank
  async getAlexaRank(domain) {
    try {
      await client.connect();
      let alexaRank = await client.get(`${this.prefixAlexaRank}_${domain}`);
      await client.quit();
      return Number(alexaRank) || null;
    } catch (error) {
      console.error(error);
    }
    return null;
  },
};
