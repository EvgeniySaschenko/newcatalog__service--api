let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let UserLogin = require(global.ROOT_PATH + '/class/user-login');

// Login to site
router.put('/login', async (req, res, next) => {
  let result;
  try {
    let userLogin = new UserLogin();
    await userLogin.auth({
      mail: req?.body?.mail,
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
      sessionId: req?.cookies?.sessionId || '',
      userId: req?.cookies?.userId || '',
      userAgent: req?.headers['user-agent'] || '',
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

router.put('/refresh-auth', async (req, res, next) => {
  let result;
  try {
    let userLogin = new UserLogin();
    result = await userLogin.refreshAuth({
      sessionId: req?.cookies?.sessionId || '',
      userId: req?.cookies?.userId || 0,
      userAgent: req?.headers['user-agent'] || '',
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

// Create user
// router.post('/create', async (req, res, next) => {
//   let user = {
//     mail: 'newcatalog.net@gmail.com',
//     password: '123456',
//   };

//   let result;
//   try {
//     let userLogin = new UserLogin();
//     await userLogin.createUser(user);
//     result = true;
//   } catch (error) {
//     let errorsMessage = new ErrorsMessage();
//     result = errorsMessage.createMessage(error);
//     res.status(result.status);
//   }
//   res.send(result);
// });

module.exports = router;
