let { M_UsersAuth, name: tableName } = require('./models/users-auth');

module.exports = {
  tableName,
  //  Create user
  async createAuth({ sessionId, userId, email, ip, userAgent, type }) {
    type = global.$config['users-auth-types'][type];
    let result = await M_UsersAuth.create({ sessionId, userId, email, ip, userAgent, type });
    return result.get({ plain: true });
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {},
};
