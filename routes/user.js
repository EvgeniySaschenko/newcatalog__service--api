let express = require('express');
let router = express.Router();
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let User = require(global.ROOT_PATH + '/class/user');
let UserLogin = require(global.ROOT_PATH + '/class/user-login');

// Login to site
router.put('/login', async (request, response, next) => {
  let result;
  try {
    let userLogin = new UserLogin();
    await userLogin.auth({
      email: request?.body?.email,
      password: request?.body?.password,
      userAgent: request?.headers['user-agent'],
      response,
      ip: request.headers['x-forwarded-for'] || '',
    });
    result = true;
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Login to site
router.put('/log-out', async (request, response, next) => {
  let result;

  try {
    let userLogin = new UserLogin();
    await userLogin.logOut({
      token: request.cookies[global.$config['users'].cookieToken] || '',
      userAgent: request.headers['user-agent'] || '',
      response,
      ip: request.headers['x-forwarded-for'] || '',
    });
    result = true;
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
  }
  response.status(401);
  response.send(result);
});

router.put('/auth-refresh', async (request, response, next) => {
  let result;
  try {
    let userLogin = new UserLogin();
    result = await userLogin.authRefresh({
      token: request.cookies[global.$config['users'].cookieToken] || '',
      userAgent: request.headers['user-agent'] || '',
      response,
      ip: request?.headers['x-forwarded-for'] || '',
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    result.status = 401;
    response.status(result.status);
  }

  if (!result) {
    response.status(401);
  }

  response.send(result);
});

// Edit password
router.put('/password', async (request, response, next) => {
  let result;
  try {
    let user = new User();
    result = await user.editPassword({
      token: request.cookies[global.$config['users'].cookieToken] || '',
      password: request.body?.password,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }

  response.send(result);
});

// Edit email
router.put('/email', async (request, response, next) => {
  let result;

  try {
    let user = new User();
    result = await user.editEmail({
      token: request.cookies[global.$config['users'].cookieToken] || '',
      email: request.body?.email,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }

  response.send(result);
});

module.exports = router;
