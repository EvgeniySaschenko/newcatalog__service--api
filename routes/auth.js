let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let UserLogin = require(global.ROOT_PATH + '/class/user-login');
let { $config } = require(global.ROOT_PATH + '/plugins/config');

// Check auth user
router.use(async (req, res, next) => {
  let isAuth = false;
  try {
    let userLogin = new UserLogin();

    await userLogin.checkAuth({
      token: req.cookies[$config['users'].cookieToken] || '',
      userAgent: req.headers['user-agent'] || '',
      ip: req.headers['x-forwarded-for'] || '',
    });
    isAuth = true;
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    errorsMessage.createMessage(error);
  }

  let excludeUrl = {
    '/api/user/login': true,
    '/api/user/log-out': true,
  };

  if (isAuth || excludeUrl[req.url]) {
    next();
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
