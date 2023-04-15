let { createClient } = require('redis');
let { DB_TEMPORARY__HOST, DB_TEMPORARY__PORT_INTERNAL, DB_TEMPORARY__DB_SITE } = process.env;
let client = createClient({
  url: `${DB_TEMPORARY__HOST}:${DB_TEMPORARY__PORT_INTERNAL}/${DB_TEMPORARY__DB_SITE}`,
});
client.on('error', async (err) => {
  console.error('Redis content "SITE"', err);
  await client.quit();
  await client.connect();
});

client.connect();

module.exports = {
  // add
  async add({ key, data }) {
    await client.set(key, JSON.stringify(data));
    return true;
  },

  // get
  async get({ key }) {
    let result = await client.get(key);
    return result ? JSON.parse(result) : false;
  },

  // delete
  async delete({ key }) {
    await client.del(key);
    return true;
  },

  // Clear db
  async clearDatabase() {
    await client.flushDb('ASYNC', function (error, succeeded) {
      if (error) throw error;
    });
    return true;
  },
};
