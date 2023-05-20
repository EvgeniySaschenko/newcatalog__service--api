let { name: tableName } = require('./models/users');
const { Op } = require('sequelize');
let { $dbMainConnect } = require('./models/_db');

module.exports = {
  tableName,
  // The request checks for the presence of at least one user in the database, so as not to create a user by default
  async checkExistUsers() {
    let result = await $dbMainConnect.models['users'].findOne();
    return result;
  },

  //  Create user
  async createUser({ email, password }) {
    let result = await $dbMainConnect.models['users'].create({ email, password });
    return result.get({ plain: true });
  },

  // Delete user
  async deleteUserByEmail({ email }) {
    return await $dbMainConnect.models['users'].destroy({ where: { email } });
  },

  // Get user by email
  async getUserByEmail({ email }) {
    let result = await $dbMainConnect.models['users'].findOne({
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
    let result = await $dbMainConnect.models['users'].update(
      {
        email,
      },
      { where: { userId } }
    );
    return result[0];
  },

  // Update user password
  async editPassword({ userId, password }) {
    let result = await $dbMainConnect.models['users'].update(
      {
        password,
      },
      { where: { userId } }
    );
    return result[0];
  },

  // Get user auth
  async getUserByUserId({ userId }) {
    let result = await $dbMainConnect.models['users'].findOne({
      where: {
        userId,
      },
    });

    return result;
  },

  // Update user info if success auth
  async editUserAuth({ userId, userAgent, sessionId }) {
    let result = await $dbMainConnect.models['users'].update(
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
    let result = await $dbMainConnect.models['users'].update(
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

  async editUsersAllLogOut() {
    let result = await $dbMainConnect.models['users'].update(
      {
        sessionId: null,
        userAgent: null,
        dateEntry: null,
        dateLoginAttempt: null,
        countLoginAttempt: 0,
      },
      {
        where: {
          dateEntry: {
            [Op.not]: null,
          },
        },
      }
    );
    return result[0];
  },

  // Update the number of login attempts
  async editUserLoginAttempt({ userId, countLoginAttempt, dateLoginAttempt }) {
    let result = await $dbMainConnect.models['users'].update(
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
