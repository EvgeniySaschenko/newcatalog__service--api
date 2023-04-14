let jwt = require('jsonwebtoken');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');

// tokenSecretKey -

module.exports = {
  // Get user data from token
  async getUserDataFromToken(token) {
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

  // Get user data from request
  async getUserDataFromRequest(request) {
    let token = request.cookies[global.$config['users'].cookieToken] || '';
    let tokenData = await this.getUserDataFromToken(token);
    let sessionId = tokenData?.sessionId || null;
    let userId = tokenData?.userId || 0;

    return {
      userAgent: request.headers['user-agent'] || '',
      ip: request.headers['x-forwarded-for'] || '',
      sessionId,
      userId,
    };
  },
};
