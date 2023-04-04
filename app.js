let isInitAppReady = false;
global.ROOT_PATH = require('app-root-path');
let { $resourcesPath } = require('./plugins/resources-path');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let routesAuth = require('./routes/auth');
let routes = require('./routes');
let fileUpload = require('express-fileupload');
let initApp = require(global.ROOT_PATH + '/init-app');
let app = express();

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

// Init
(async function () {
  await initApp.init();
  isInitAppReady = true;
})();

// Checking app readiness
app.use((req, res, next) => {
  if (isInitAppReady) {
    next();
  } else {
    res.sendStatus(202);
  }
});

// Check auth user
app.use(routesAuth);

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
