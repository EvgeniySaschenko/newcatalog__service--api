global.ROOT_PATH = require('app-root-path');
let { $resourcesPath } = require('./plugins/resources-path');
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let routes = require('./routes');
let bodyParser = require('body-parser');
let fileUpload = require('express-fileupload');
let { M_Sections } = require(global.ROOT_PATH + '/models/sections');
let { M_RecordsDeleted } = require(global.ROOT_PATH + '/models/records-deleted');
let { M_Ratings } = require(global.ROOT_PATH + '/models/ratings');
let { M_Sites } = require(global.ROOT_PATH + '/models/sites');
let { M_Labels } = require(global.ROOT_PATH + '/models/labels');
let { M_SitesScreenshots } = require(global.ROOT_PATH + '/models/sites-screenshots');
let { M_RatingsItems } = require(global.ROOT_PATH + '/models/ratings-items');
let { M_CacheInfo, Scheme, name } = require(global.ROOT_PATH + '/models/cache-info');
let { $db } = require('./models/_db');
let app = express();
let { Op } = require('sequelize');
let fsExtra = require('fs-extra');
let axios = require('axios');
// $db.getQueryInterface().createTable(name, new Scheme());

let { fork } = require('child_process');
fork('./init-app', [global.ROOT_PATH]);

// let fs = require('fs');
// let logos = fs.readdirSync('./data/dev/images/sites-logos');

// let screens = fs.readdirSync('./images/sites-screens');
(async () => {
  // let result = await M_SitesScreenshots.findAll();
  // for await (let { siteScreenshotId, dateCreate } of result) {
  //   await M_SitesScreenshots.update(
  //     {
  //       visitorId: 0,
  //     },
  //     {
  //       where: { siteScreenshotId },
  //     }
  //   );
  // }
  // console.log(logos);
  // let scrSites = await M_Sites.findAll({
  //   attributes: ['siteId', 'color'],
  //   where: {
  //     color: {
  //       [Op.ne]: null,
  //     },
  //   },
  //   order: [['color', 'ASC']],
  // });
  // for await (let { siteId, color } of scrSites) {
  //   //console.log(color, rgb2hex(color));
  //   await M_Sites.update(
  //     { color: rgb2hex(color).hex },
  //     {
  //       where: {
  //         siteId,
  //       },
  //     }
  //   );
  // }
  // let scrScrrens = await M_SitesScreenshots.findAll({
  //   attributes: ['siteScreenshotId', 'siteId'],
  //   where: {
  //     dateScreenshotCreated: {
  //       [Op.ne]: null,
  //     },
  //     dateScreenshotError: null,
  //   },
  //   order: [['dateCreate', 'ASC']],
  // });
  // for await (let { siteScreenshotId, siteId } of scrScrrens) {
  //   console.log({ siteScreenshotId, siteId });
  //   await M_Sites.update(
  //     { siteScreenshotId },
  //     {
  //       where: {
  //         siteId,
  //       },
  //     }
  //   );
  // }
  // for await (let { siteScreenshotId, siteId, dateLogoCreated } of scrScrrens) {
  //   let result = await M_SitesLogos.create({
  //     siteId,
  //     dateCreate: dateLogoCreated,
  //     siteScreenshotId,
  //   });
  //   let { siteLogoId } = result.get({ plain: true });
  //   await fsExtra.copySync(
  //     `./data/dev/images/sites-logos/${siteScreenshotId}.jpg`,
  //     `./data/dev/images/sites-logos-new/${siteLogoId}.jpg`,
  //     (err) => {
  //       if (err) return console.error(err);
  //     }
  //   );
  // }
  // let scrLogo = await M_SitesLogos.findAll({
  //   attributes: ['siteScreenshotId', 'siteLogoId'],
  //   order: [['dateCreate', 'ASC']],
  // });
  // for await (let { siteScreenshotId, siteLogoId } of scrLogo) {
  //   await fsExtra.copySync(
  //     `./data/dev/images/sites-logos/${siteScreenshotId}.jpg`,
  //     `./data/dev/images/sites-logos-new/${siteLogoId}.jpg`
  //   );
  // }
  // for await (let { siteScreenshotId, siteLogoId } of scrLogo) {
  //   console.log(siteScreenshotId);
  //   await M_Sites.update(
  //     { siteLogoId },
  //     {
  //       where: {
  //         siteScreenshotId,
  //       },
  //     }
  //   );
  // }
  // for await (let item of logos) {
  //   fs.stat(`./data/dev/images/sites-logos/${item}`, async function (err, stat) {
  //     let siteLogoId = item.replace('.jpg', '');
  //     console.log(stat.mtime);
  //     await M_Sites.update(
  //       { dateLogoCreate: stat.mtime },
  //       {
  //         where: {
  //           siteLogoId,
  //         },
  //       }
  //     );
  //   });
  // }
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
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, $resourcesPath.dataFilesPublicPath)));

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
