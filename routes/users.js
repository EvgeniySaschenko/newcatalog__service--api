let express = require('express');
let router = express.Router();
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let Users = require(global.ROOT_PATH + '/class/users');
let UsersAuth = require(global.ROOT_PATH + '/class/users-auth');

// Login to site
router.put('/login', async (request, response, next) => {
  let result;
  try {
    $utils['errors'].serverMessageDemoMode();

    let { userAgent, ip } = $utils['users'].getUserDataFromRequest(request);

    let users = new Users();
    let usersAuth = new UsersAuth();
    await usersAuth.login({
      email: request?.body.email,
      password: users.encryptPassword(request?.body.password),
      userAgent,
      response,
      ip,
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
    $utils['errors'].serverMessageDemoMode();
    let { userAgent, ip, sessionId, userId } = $utils['users'].getUserDataFromRequest(request);

    let usersAuth = new UsersAuth();
    await usersAuth.logOut({
      sessionId,
      userId,
      userAgent,
      response,
      ip,
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
    let { userAgent, ip, sessionId, userId } = $utils['users'].getUserDataFromRequest(request);

    let usersAuth = new UsersAuth();
    result = await usersAuth.authRefresh({
      sessionId,
      userId,
      userAgent,
      response,
      ip,
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
    $utils['errors'].serverMessageDemoMode();

    let { userId } = $utils['users'].getUserDataFromRequest(request);
    let users = new Users();
    result = await users.editPassword({
      userId,
      password: request.body?.password,
      password2: request.body?.password2,
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
    $utils['errors'].serverMessageDemoMode();
    let users = new Users();
    let { userId } = $utils['users'].getUserDataFromRequest(request);
    result = await users.editEmail({
      userId,
      email: request.body?.email,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }

  response.send(result);
});

module.exports = router;
