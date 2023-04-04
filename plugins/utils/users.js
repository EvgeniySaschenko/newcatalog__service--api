let jwt = require('jsonwebtoken');
let { v4: uuidv4 } = require('uuid');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');
let crypto = require('crypto');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $config } = require(global.ROOT_PATH + '/plugins/config');

module.exports = {
  // Create token
  async createToken({ data, expiresIn }) {
    let tokenSecretKey = await $dbTemporary['settings'].getServiceApiTokenSecretKey();
    if (!tokenSecretKey) {
      tokenSecretKey = uuidv4();
      await $dbTemporary['settings'].addServiceApiTokenSecretKey(tokenSecretKey);
    }

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
    let tokenSecretKey = await $dbTemporary['settings'].getServiceApiTokenSecretKey();

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
    let { passwordLengthMin, passwordLengthMax, salt } = $config['users'];
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
