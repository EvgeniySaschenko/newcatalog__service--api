let { createClient } = require('redis');
let fse = require('fs-extra');

let { DB_TEMPORARY__HOST } = process.env;
const client = createClient({
  url: DB_TEMPORARY__HOST,
});
client.on('error', (err) => console.error('Redis Client Error', err));

module.exports = {
  $dbTemporary: {
    prefixAlexaRank: 'alexa_rank',

    // Создать бузу AlexaRank
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
      await client.disconnect();
    },

    // Получить AlexaRank
    async getAlexaRank(domain) {
      try {
        await client.connect();
        let alexaRank = await client.get(`${this.prefixAlexaRank}_${domain}`);
        await client.disconnect();
        return Number(alexaRank) || null;
      } catch (error) {
        console.error(error);
      }
      return null;
    },
  },
};
