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
    password = $utils['user'].encryptPassword(password);
    let user = await $dbMain['users'].getUserByEmail({ email });
    if (!user) {
      result = await $dbMain['users'].createUser({ email, password });
    }
    return result;
  }
}

module.exports = User;
