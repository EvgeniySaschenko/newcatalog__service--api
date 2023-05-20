global.ROOT_PATH = require('app-root-path');
global.$config = require('./config');
let { $utils } = require('./plugins/utils');
let express = require('express');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let routesAuth = require('./routes/auth');
let routes = require('./routes');
let fileUpload = require('express-fileupload');
let AppMain = require(global.ROOT_PATH + '/class/app-main');
let app = express();
let { IS_DEMO_MODE } = process.env;

process.on('uncaughtException', function (error) {
  console.error(error);
  process.exit(1); // terminates process
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, '')));

// Init
(async function () {
  let appMain = new AppMain();
  await appMain.init();
})();

// Protection server blocked
app.use(async (req, res, next) => {
  let appMain = new AppMain();
  let isAllow = await appMain.checkProtection();

  if (isAllow) {
    next();
  } else {
    res.sendStatus(202);
  }
});

// Interior blocked
app.use((req, res, next) => {
  if (!$utils['service'].checkIsServiceBlocked()) {
    next();
  } else {
    res.sendStatus(202);
  }
});

// Checking app readiness (Until the api server is fully ready, where the user will get status 202)
app.use((req, res, next) => {
  if (!$utils['service'].checkIsServiceBlocked()) {
    next();
  } else {
    res.sendStatus(202);
  }
});

// Check auth user
if (!IS_DEMO_MODE) {
  app.use(routesAuth);
}

// Data api
app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.sendStatus(404);
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.sendStatus(err.status || 500);
});

module.exports = app;
