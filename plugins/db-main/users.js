let { M_Users, name: tableName } = require(global.ROOT_PATH + '/models/users');

module.exports = {
  tableName,
  //  Create user
  async createUser({ mail, password }) {
    let result = await M_Users.create({ mail, password });
    return result.get({ plain: true });
  },

  // Get user by mail
  async getUserByMail({ mail }) {
    let result = await M_Users.findOne({
      attributes: [
        'userAgent',
        'sessionId',
        'userId',
        'dateEntry',
        'countLoginAttempt',
        'password',
        'dateLoginAttempt',
      ],
      where: {
        mail,
      },
    });
    return result;
  },

  // Get user auth
  async getUserByUserId({ userId }) {
    let result = await M_Users.findOne({
      where: {
        userId,
      },
    });

    return result;
  },

  // Update user info if success auth
  async editUserAuth({ userId, userAgent, sessionId }) {
    let result = await M_Users.update(
      {
        sessionId,
        userAgent,
        dateEntry: new Date(),
        dateLoginAttempt: null,
        countLoginAttempt: 0,
      },
      { where: { userId } }
    );
    return result[0];
  },

  // Update user info log out
  async editUserLogOut({ sessionId, userId, userAgent }) {
    let result = await M_Users.update(
      {
        sessionId: null,
        userAgent: null,
        dateEntry: null,
        dateLoginAttempt: null,
        countLoginAttempt: 0,
      },
      { where: { sessionId, userId, userAgent } }
    );
    return result[0];
  },

  // Update the number of login attempts
  async editUserLoginAttempt({ userId, countLoginAttempt, dateLoginAttempt }) {
    let result = await M_Users.update(
      {
        dateLoginAttempt,
        countLoginAttempt,
      },
      { where: { userId } }
    );
    return result[0];
  },
};
