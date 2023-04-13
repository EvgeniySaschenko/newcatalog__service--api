let express = require('express');
let router = express.Router();
let UserLogin = require(global.ROOT_PATH + '/class/user-login');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

// Check auth user
router.use(async (request, response, next) => {
  let isAuth = false;
  try {
    let userLogin = new UserLogin();

    await userLogin.checkAuth({
      token: request.cookies[global.$config['users'].cookieToken] || '',
      userAgent: request.headers['user-agent'] || '',
      ip: request.headers['x-forwarded-for'] || '',
    });
    isAuth = true;
  } catch (error) {
    $utils['errors'].createResponse({ request, error });
  }

  let excludeUrl = {
    '/api/user/login': true,
    '/api/user/log-out': true,
  };

  if (isAuth || excludeUrl[request.url]) {
    next();
  } else {
    response.sendStatus(401);
  }
});

module.exports = router;
