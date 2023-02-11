let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let SitesScreenshots = require(global.ROOT_PATH + '/class/sites-screenshots');
let Sites = require(global.ROOT_PATH + '/class/sites');

// Елементы рейтинга для которых есть скриншоты, которые нужно обработать
router.get('/screenshots/:ratingId', async (req, res, next) => {
  let result;
  try {
    let { ratingId } = req.params;
    let sitesScreenshots = new SitesScreenshots();

    result = await sitesScreenshots.getReadyScreenshotsForRating({ ratingId });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Логотип сайта
router.put('/logo', async (req, res, next) => {
  let result;
  try {
    let sites = new Sites();
    result = await sites.runLogoCreate(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
