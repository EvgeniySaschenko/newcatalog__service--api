global.ROOT_PATH = require('app-root-path');
let { $resourcesPath } = require('./plugins/resources-path');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let routes = require('./routes');
let fileUpload = require('express-fileupload');

let UserLogin = require(global.ROOT_PATH + '/class/user-login');
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let Translations = require(global.ROOT_PATH + '/class/translations');

let app = express();

let { fork } = require('child_process');

fork('./init-app', [global.ROOT_PATH]);

(async function () {
  // let xx = await $db.getQueryInterface().createDatabase('nc_translations');
  // console.log(xx);
  // $db.query('CREATE DATABASE IF NOT EXISTS `nc_translations`;').then((data) => {
  //   console.log(data);
  // });
})();
// $db.getQueryInterface().createDatabase('nc_translations');

// let translations = new Translations();

// translations.runCreateTranslitions({
//   pathRoot: 'symlinks/service--site',
//   typeName: 'service--site',
// });

// let translations2 = new Translations();

// translations2.runCreateTranslitions({
//   pathRoot: 'symlinks/service--admin',
//   typeName: 'service--admin',
// });

// let translations3 = new Translations();

// translations3.runCreateTranslitions({ pathRoot: './', typeName: 'service--api' });

// let { $db } = require('./plugins/db-main/models/_db');
// let { M_Translations, Scheme, name } = require(global.ROOT_PATH +
//   '/plugins/db-main/models/translations');
// (async function () {
//   await $db.getQueryInterface().createTable(name, new Scheme());
// })();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, $resourcesPath.dataFilesPublicPath)));

app.use('/images', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Don't skip if user is not logged in
app.use(async (req, res, next) => {
  let isAuth = false;
  try {
    let userLogin = new UserLogin();

    await userLogin.checkAuth({
      token: req.cookies[$config.users.cookieToken] || '',
      userAgent: req.headers['user-agent'] || '',
      ip: req.headers['x-forwarded-for'] || '',
    });
    isAuth = true;
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
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

app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.sendStatus(404);
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.sendStatus(err.status || 500);
});

module.exports = app;
