let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let User = require(global.ROOT_PATH + '/class/user');
let UserLogin = require(global.ROOT_PATH + '/class/user-login');
let { $config } = require(global.ROOT_PATH + '/plugins/config');

// Login to site
router.put('/login', async (req, res, next) => {
  let result;
  try {
    let userLogin = new UserLogin();
    await userLogin.auth({
      email: req?.body?.email,
      password: req?.body?.password,
      userAgent: req?.headers['user-agent'],
      response: res,
      ip: req?.headers['x-forwarded-for'] || '',
    });
    result = true;
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Login to site
router.put('/log-out', async (req, res, next) => {
  let result;

  try {
    let userLogin = new UserLogin();
    await userLogin.logOut({
      token: req.cookies[$config.users.cookieToken] || '',
      userAgent: req.headers['user-agent'] || '',
      response: res,
      ip: req?.headers['x-forwarded-for'] || '',
    });
    result = true;
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
  }
  res.status(401);
  res.send(result);
});

router.put('/auth-refresh', async (req, res, next) => {
  let result;
  try {
    let userLogin = new UserLogin();
    result = await userLogin.authRefresh({
      token: req.cookies[$config.users.cookieToken] || '',
      userAgent: req.headers['user-agent'] || '',
      response: res,
      ip: req?.headers['x-forwarded-for'] || '',
    });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    result.status = 401;
    res.status(result.status);
  }

  if (!result) {
    res.status(401);
  }

  res.send(result);
});

// Edit password
router.put('/password', async (req, res, next) => {
  let result;
  try {
    let user = new User();
    result = await user.editPassword({
      token: req.cookies[$config.users.cookieToken] || '',
      password: req?.body?.password,
    });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }

  res.send(result);
});

// Edit email
router.put('/email', async (req, res, next) => {
  let result;

  try {
    let user = new User();
    result = await user.editEmail({
      token: req.cookies[$config.users.cookieToken] || '',
      email: req?.body?.email,
    });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }

  res.send(result);
});

module.exports = router;
