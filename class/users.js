let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { v4: uuidv4 } = require('uuid');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');
let crypto = require('crypto');

class Users {
  // Create user - Only 1 user is created now
  async createUserDefault() {
    let result;
    let email = global.$config['users'].emailDefault;
    let password = global.$config['users'].passwordDefault;
    password = this.encryptPassword(password);
    let user = await $dbMain['users'].checkExistUsers();
    if (!user) {
      result = await $dbMain['users'].createUser({ email, password });
    }
    return result;
  }

  // Edit email
  async editEmail({ userId, email }) {
    let result;
    let user = await $dbMain['users'].getUserByEmail({ email });
    if (user) {
      $utils['errors'].validationMessage({
        path: 'email',
        message: $t('This e-mail already exists'),
      });
    }

    result = await $dbMain['users'].editEmail({ email, userId });
    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Edit password
  async editPassword({ userId, password }) {
    let result;
    password = this.encryptPassword(password);
    result = await $dbMain['users'].editPassword({ password, userId });
    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Encrypt password
  encryptPassword(password) {
    if (!password) {
      $utils['errors'].validationMessage({
        path: 'password',
        message: $t('Field cannot be empty'),
      });
    }

    password = String(password);

    let { passwordLengthMin, passwordLengthMax, salt } = global.$config['users'];
    if (password.length < passwordLengthMin || password.length > passwordLengthMax) {
      $utils['errors'].validationMessage({
        path: 'password',
        message: `${$t('The number of characters in a string must be in the range:')} 
        ${passwordLengthMin} - ${passwordLengthMax}`,
      });
    }

    password = crypto
      .createHash('md5')
      .update(password + salt)
      .digest('hex');

    password = crypto
      .createHash('md5')
      .update(password + salt)
      .digest('hex');

    return password;
  }

  /*
    This secret key is used to encrypt/decrypt the user token
    It is created when the server is started (if not in the database)
    A copy is not stored in the main database so that it does not end up in the backup copy
  */
  async createTokenUserSecretKey() {
    let tokenSecretKey = await $dbTemporary['api'].getTokenUserSecretKey();

    if (tokenSecretKey) {
      $utils['users'].setTokenUserSecretKey(tokenSecretKey);
      return false;
    }

    tokenSecretKey = uuidv4();
    $utils['users'].setTokenUserSecretKey(tokenSecretKey);
    await $dbTemporary['api'].addTokenUserSecretKey(tokenSecretKey);
    return true;
  }
}

module.exports = Users;
