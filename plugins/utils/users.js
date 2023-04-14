let jwt = require('jsonwebtoken');
let { v4: uuidv4 } = require('uuid');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');
let crypto = require('crypto');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');

// tokenSecretKey -

module.exports = {
  /*
    This secret key is used to encrypt/decrypt the user token
    It is created when the server is started (if not in the database)
    A copy is not stored in the main database so that it does not end up in the backup copy
  */
  async createTokenUserSecretKey() {
    let tokenSecretKey = await $dbTemporary['api'].getTokenUserSecretKey();
    if (!tokenSecretKey) {
      tokenSecretKey = uuidv4();
      await $dbTemporary['api'].addTokenUserSecretKey(tokenSecretKey);
    }
  },

  // Create token
  async createToken({ data, expiresIn }) {
    await this.createTokenUserSecretKey();
    let tokenSecretKey = await $dbTemporary['api'].getTokenUserSecretKey();

    let token = jwt.sign(
      {
        data,
      },
      tokenSecretKey,
      { expiresIn }
    );

    return token;
  },

  // Get token
  async getTokenData({ token }) {
    let tokenSecretKey = await $dbTemporary['api'].getTokenUserSecretKey();

    let data;
    jwt.verify(token, tokenSecretKey, function (err, decoded) {
      if (err) {
        data = false;
      }

      data = decoded?.data || false;
    });
    return data;
  },

  // Encrypt password
  encryptPassword(password) {
    let { passwordLengthMin, passwordLengthMax, salt } = global.$config['users'];
    if (password.length < passwordLengthMin || password.length > passwordLengthMax) {
      let errors = [
        {
          path: 'password',
          message: `${$t('The number of characters in a string must be in the range:')} 
          ${passwordLengthMin} - ${passwordLengthMax}`,
        },
      ];

      throw {
        errors,
      };
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
  },
};
