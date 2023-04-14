let express = require('express');
let router = express.Router();
let UsersAuth = require(global.ROOT_PATH + '/class/users-auth');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

// Check auth user
router.use(async (request, response, next) => {
  let isAuth = false;
  try {
    let usersAuth = new UsersAuth();
    let { userAgent, ip, sessionId, userId } = await $utils['users'].getUserDataFromRequest(
      request
    );
    await usersAuth.checkAuth({
      userAgent,
      ip,
      sessionId,
      userId,
    });
    isAuth = true;
  } catch (error) {
    $utils['errors'].createResponse({ request, error });
  }

  if (isAuth || global.$config['users'].urlWithoutLogin[request.url]) {
    next();
  } else {
    response.sendStatus(401);
  }
});

module.exports = router;
