let jwt = require('jsonwebtoken');

let tokenUserSecretKey = null;

module.exports = {
  // Set token secret key (This key is needed to get data from the token)
  async setTokenUserSecretKey(secretKey) {
    tokenUserSecretKey = secretKey;
  },

  // Get user data from token
  getUserDataFromToken(token) {
    let data;
    jwt.verify(token, tokenUserSecretKey, function (err, decoded) {
      if (err) {
        data = false;
      }

      data = decoded?.data || false;
    });
    return data;
  },

  // Get user data from request
  getUserDataFromRequest(request) {
    let token = request.cookies[global.$config['users'].cookieToken] || '';
    let tokenData = this.getUserDataFromToken(token);
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
