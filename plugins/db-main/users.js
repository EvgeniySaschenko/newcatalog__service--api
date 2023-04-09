let { M_Users, name: tableName } = require('./models/users');

module.exports = {
  tableName,
  //  Create user
  async createUser({ email, password }) {
    let result = await M_Users.create({ email, password });
    return result.get({ plain: true });
  },

  // Get user by email
  async getUserByEmail({ email }) {
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
        email,
      },
    });
    return result;
  },

  // Update user email
  async editEmail({ userId, email }) {
    let result = await M_Users.update(
      {
        email,
      },
      { where: { userId } }
    );
    return result;
  },

  // Update user password
  async editPassword({ userId, password }) {
    let result = await M_Users.update(
      {
        password,
      },
      { where: { userId } }
    );
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

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {},
};
