let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let crypto = require('crypto');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { v4: uuidv4 } = require('uuid');

class User {
  // Create user - Only 1 user is created now
  async createUserDefault() {
    let result;
    let email = $config.users.emailDefault;
    let password = $config.users.passwordDefault;
    password = $utils['users'].encryptPassword(password);
    let user = await $dbMain['users'].getUserByEmail({ email });
    if (!user) {
      result = await $dbMain['users'].createUser({ email, password });
    }
    return result;
  }

  // Edit email
  async editEmail({ token, email }) {
    let result;
    let user = await $dbMain['users'].getUserByEmail({ email });
    if (user) {
      throw {
        errors: [
          {
            path: 'email',
            message: $errors['This e-mail already exists'],
          },
        ],
      };
    }

    let { userId } = await $utils['users'].getTokenData({ token });
    result = await $dbMain['users'].editEmail({ email, userId });
    return result;
  }

  // Edit password
  async editPassword({ token, password }) {
    let result;
    let { userId } = await $utils['users'].getTokenData({ token });
    password = $utils['users'].encryptPassword(password);
    result = await $dbMain['users'].editPassword({ password, userId });
    return result;
  }
}

module.exports = User;
