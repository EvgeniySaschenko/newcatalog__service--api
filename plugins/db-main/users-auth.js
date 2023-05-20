let { name: tableName } = require('./models/users-auth');
let { $dbMainConnect } = require('./models/_db');

module.exports = {
  tableName,
  //  Create record - about login/logout attempts
  async createRecord({ sessionId, userId, email, ip, userAgent, type }) {
    type = global.$config['users-auth-types'][type];
    let result = await $dbMainConnect.models['users_auth'].create({
      sessionId,
      userId,
      email,
      ip,
      userAgent,
      type,
    });
    return result.get({ plain: true });
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {},
};
