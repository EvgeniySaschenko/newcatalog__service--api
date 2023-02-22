let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let SitesScreenshots = require(global.ROOT_PATH + '/class/sites-screenshots');
let Sites = require(global.ROOT_PATH + '/class/sites');

// Get site
router.get('/:siteId', async (req, res, next) => {
  let result;
  try {
    let { siteId } = req.params;
    let sites = new Sites();
    result = await sites.getSiteBySiteId({ siteId });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Get sites with screenshots for creating logos
router.get('/screenshots/:ratingId', async (req, res, next) => {
  let result;
  try {
    let { ratingId } = req.params;
    let sitesScreenshots = new SitesScreenshots();

    result = await sitesScreenshots.getItemsReadyScrenshotsNotLogo({ ratingId });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Get sites with screenshot error
router.get('/screenshots-errors/:ratingId', async (req, res, next) => {
  let result;
  try {
    let { ratingId } = req.params;
    let sitesScreenshots = new SitesScreenshots();

    result = await sitesScreenshots.getItemsScrenshotsErrors({ ratingId });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Create new screenshot
router.post('/screenshot-create', async (req, res, next) => {
  let result;

  try {
    let { siteId, url } = req.body;
    let sitesScreenshots = new SitesScreenshots();

    result = await sitesScreenshots.addSiteToProcessing({ siteId, url });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Create custom screenshot
router.post('/screenshot-custom', async (req, res, next) => {
  let result;
  try {
    let { siteId } = req.body;
    let sitesScreenshots = new SitesScreenshots();
    result = await sitesScreenshots.runCustomScreenshotCreate({
      fileImg: req.files.screenshotFile,
      siteId: +siteId,
    });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Create logo site
router.put('/logo-create', async (req, res, next) => {
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

// Logo site recreate
router.put('/logo-recreate', async (req, res, next) => {
  let result;
  try {
    let { siteId } = req.body;
    let sites = new Sites();
    result = await sites.runRecreateLogo({ siteId });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Update sites color
router.put('/color', async (req, res, next) => {
  let result;
  try {
    let { siteScreenshotId, color } = req.body;
    let sites = new Sites();
    result = await sites.editSitesColor({ siteScreenshotId, color });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Check for images for the site
router.get('/images-site-check/:domain', async (req, res, next) => {
  let result;
  try {
    let { domain } = req.params;
    let sites = new Sites();
    result = await sites.checkImagesForSite({ host: domain });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Link domain images to subdomain
router.put('/images-domain-to-subdomain', async (req, res, next) => {
  let result;
  try {
    let { domainSiteId, subdomainSiteId } = req.body;
    let sites = new Sites();
    result = await sites.linkDomainImagesToSubdomain({ domainSiteId, subdomainSiteId });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
