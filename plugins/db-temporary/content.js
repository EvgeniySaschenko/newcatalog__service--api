let { createClient } = require('redis');
let { DB_TEMPORARY__HOST, DB_TEMPORARY__PORT_INTERNAL, DB_TEMPORARY__DB_CONTENT } = process.env;
let client = createClient({
  url: `${DB_TEMPORARY__HOST}:${DB_TEMPORARY__PORT_INTERNAL}/${DB_TEMPORARY__DB_CONTENT}`,
});
client.on('error', (err) => {
  console.error('Redis Content Error', err);
  client.quit();
});

module.exports = {
  // add
  async add({ prefix, data }) {
    try {
      await client.connect();
      await client.set(prefix, JSON.stringify(data));
      await client.quit();
      return true;
    } catch (error) {
      client.quit();
      throw error;
    }
  },

  // get
  async get({ prefix }) {
    try {
      await client.connect();
      let result = await client.get(prefix);
      await client.quit();
      return result ? JSON.parse(result) : false;
    } catch (error) {
      client.quit();
      throw error;
    }
  },

  // delete
  async delete({ prefix }) {
    try {
      await client.connect();
      await client.del(prefix);
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
