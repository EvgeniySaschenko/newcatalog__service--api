let { M_UsersAuth, name: tableName } = require(global.ROOT_PATH + '/models/users-auth');

module.exports = {
  tableName,
  usersAuthTypes: {
    login: 1,
    refresh: 2,
    attempt: 3,
    incorrect: 4,
    'another-device': 5,
    'log-out': 6,
    'refresh-incorrect': 7,
    'refresh-log-out': 8,
    'check-auth-error': 9,
  },
  //  Create user
  async createAuth({ mail, ip, userAgent, type }) {
    type = this.usersAuthTypes[type];
    let result = await M_UsersAuth.create({ mail, ip, userAgent, type });
    return result.get({ plain: true });
  },
};
