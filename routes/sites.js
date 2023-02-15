let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let SitesScreenshots = require(global.ROOT_PATH + '/class/sites-screenshots');
let Sites = require(global.ROOT_PATH + '/class/sites');

// Get a site with screenshots for creating logos
router.get('/screenshots/:ratingId', async (req, res, next) => {
  let result;
  try {
    let { ratingId } = req.params;
    let sitesScreenshots = new SitesScreenshots();

    result = await sitesScreenshots.getItemsReadyScrenshotNotLogo({ ratingId });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Logo site
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
