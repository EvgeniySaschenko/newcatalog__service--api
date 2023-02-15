global.ROOT_PATH = require('app-root-path');
let { $resourcesPath } = require('./plugins/resources-path');
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let routes = require('./routes');
let { M_SitesScreenshots } = require(global.ROOT_PATH + '/models/sites-screenshots');

let app = express();

let { fork } = require('child_process');
fork('./init-app', [global.ROOT_PATH]);

// let fs = require('fs');
// let logos = fs.readdirSync('./images/sites-logos');
// let screens = fs.readdirSync('./images/sites-screens');
(async () => {
  // let errs = await M_SitesScreenshots.findAll({
  //   attributes: ['siteScreenshotId', 'dateCreate'],
  //   where: {
  //     dateScreenshotError: null,
  //   },
  //   order: [['dateCreate', 'DESC']],
  // });
  // for await (let item of errs) {
  //   await M_SitesScreenshots.update(
  //     { errorMessage: null },
  //     {
  //       where: {
  //         siteScreenshotId: item.siteScreenshotId,
  //       },
  //     }
  //   );
  // }
  //   for await (let item of logos) {
  //     fs.stat(`./images/sites-logos/${item}`, async function (err, stat) {
  //       let siteScreenshotId = item.replace('.png', '');
  //       console.log(stat.mtime);
  //       await M_SitesScreenshots.update(
  //         { dateLogoCreated: stat.mtime },
  //         {
  //           where: {
  //             siteScreenshotId,
  //           },
  //         }
  //       );
  //     });
  //   }
  //   for await (let item of screens) {
  //     fs.stat(`./images/sites-screens/${item}`, async function (err, stat) {
  //       let siteScreenshotId = item.replace('.png', '');
  //       console.log(stat.mtime);
  //       await M_SitesScreenshots.update(
  //         { dateScreenshotCreated: stat.mtime },
  //         {
  //           where: {
  //             siteScreenshotId,
  //           },
  //         }
  //       );
  //     });
  //   }
  //   let err = await M_SitesScreenshots.findAll({
  //     attributes: ['siteScreenshotId', 'dateCreate'],
  //     where: {
  //       isError: true,
  //     },
  //     order: [['dateCreate', 'DESC']],
  //   });
  //   for await (let item of err) {
  //     await M_SitesScreenshots.update(
  //       { dateScreenshotError: item.dateCreate },
  //       {
  //         where: {
  //           siteScreenshotId: item.siteScreenshotId,
  //         },
  //       }
  //     );
  //   }
})();

app.use('/images', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, $resourcesPath.dataFilesPublicPath)));

app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.sendStatus(404);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.sendStatus(err.status || 500);
});

module.exports = app;
