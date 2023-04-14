let { createClient } = require('redis');
let { DB_TEMPORARY__HOST, DB_TEMPORARY__PORT_INTERNAL, DB_TEMPORARY__DB_SITE } = process.env;
let client = createClient({
  url: `${DB_TEMPORARY__HOST}:${DB_TEMPORARY__PORT_INTERNAL}/${DB_TEMPORARY__DB_SITE}`,
});
client.on('error', (err) => {
  console.error('Redis Content Error', err);
  client.quit();
});

module.exports = {
  // add
  async add({ key, data }) {
    try {
      await client.connect();
      await client.set(key, JSON.stringify(data));
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      throw error;
    }
  },

  // get
  async get({ key }) {
    try {
      await client.connect();
      let result = await client.get(key);
      await client.quit();
      return result ? JSON.parse(result) : false;
    } catch (error) {
      client.quit();
      throw error;
    }
  },

  // delete
  async delete({ key }) {
    try {
      await client.connect();
      await client.del(key);
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      throw error;
    }
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
      throw error;
    }
  },
};
