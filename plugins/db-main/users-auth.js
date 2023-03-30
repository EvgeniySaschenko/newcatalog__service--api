let { M_UsersAuth, name: tableName } = require('./models/users-auth');
let { $config } = require(global.ROOT_PATH + '/plugins/config');

module.exports = {
  tableName,
  //  Create user
  async createAuth({ sessionId, userId, email, ip, userAgent, type }) {
    type = $config['users-auth-types'][type];
    let result = await M_UsersAuth.create({ sessionId, userId, email, ip, userAgent, type });
    return result.get({ plain: true });
  },
};
