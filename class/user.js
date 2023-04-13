let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

class User {
  // Create user - Only 1 user is created now
  async createUserDefault() {
    let result;
    let email = global.$config['users'].emailDefault;
    let password = global.$config['users'].passwordDefault;
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
      $utils['errors'].validationMessage({
        path: 'email',
        message: $t('This e-mail already exists'),
      });
    }

    let { userId } = await $utils['users'].getTokenData({ token });
    result = await $dbMain['users'].editEmail({ email, userId });
    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Edit password
  async editPassword({ token, password }) {
    let result;
    let { userId } = await $utils['users'].getTokenData({ token });
    password = $utils['users'].encryptPassword(password);
    result = await $dbMain['users'].editPassword({ password, userId });
    if (!result) $utils['errors'].serverMessage();
    return true;
  }
}

module.exports = User;
