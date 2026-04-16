let express = require('express');
let router = express.Router();
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let SitesScreenshots = require(global.ROOT_PATH + '/class/sites-screenshots');
let Sites = require(global.ROOT_PATH + '/class/sites');

// Get site
router.get('/:siteId', async (request, response, next) => {
  let result;
  try {
    let { siteId } = request.params;
    let sites = new Sites();
    result = await sites.getSiteBySiteId({ siteId });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Get sites with screenshots for creating logos
router.get('/screenshots/:ratingId', async (request, response, next) => {
  let result;
  try {
    let { ratingId } = request.params;
    let sitesScreenshots = new SitesScreenshots();
    result = await sitesScreenshots.getItemsReadyScrenshotsNotLogo({ ratingId });
    $utils['common'].createFileCacheAdmin({
      filePath: `sites/screenshots/${ratingId}.json`,
      data: result,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Get sites with screenshot error
router.get('/screenshots-errors/:ratingId', async (request, response, next) => {
  let result;
  try {
    let { ratingId } = request.params;
    let sitesScreenshots = new SitesScreenshots();

    result = await sitesScreenshots.getItemsScrenshotsErrors({ ratingId });
    $utils['common'].createFileCacheAdmin({
      filePath: `sites/screenshots-errors/${ratingId}.json`,
      data: result,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Create new screenshot
router.post('/screenshot-create', async (request, response, next) => {
  let result;

  try {
    let { siteId, url } = request.body;
    let sitesScreenshots = new SitesScreenshots();

    result = await sitesScreenshots.addSiteToProcessing({ siteId, url });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Create custom screenshot
router.post('/screenshot-custom', async (request, response, next) => {
  let result;
  try {
    let { siteId } = request.body;
    let sitesScreenshots = new SitesScreenshots();
    result = await sitesScreenshots.runCustomScreenshotCreate({
      fileImg: request.files.screenshotFile,
      siteId: +siteId,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Restart screenshots create process
router.put('/screenshots-process-restart', async (request, response, next) => {
  let result;
  try {
    $utils['errors'].serverMessageDemoMode();
    let sitesScreenshots = new SitesScreenshots();
    result = await sitesScreenshots.restartProccessScreenshotsCreates();
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Restart proccess sites info update
router.put('/sites-process-restart', async (request, response, next) => {
  let result;
  try {
    $utils['errors'].serverMessageDemoMode();
    let sites = new Sites();
    result = await sites.restartProccessSitesInfoUpdate(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Create logo site
router.put('/logo-create', async (request, response, next) => {
  let result;

  try {
    let sites = new Sites();
    result = await sites.runLogoCreate(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Logo site recreate
router.put('/logo-recreate', async (request, response, next) => {
  let result;
  try {
    let { siteId } = request.body;
    let sites = new Sites();
    result = await sites.runRecreateLogo({ siteId });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Update sites color
router.put('/color', async (request, response, next) => {
  let result;
  try {
    let { siteScreenshotId, color } = request.body;
    let sites = new Sites();
    result = await sites.editSitesColor({ siteScreenshotId, color });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Check for images for the site
router.get('/images-site-check/:domain', async (request, response, next) => {
  let result;
  try {
    let { domain } = request.params;
    let sites = new Sites();
    result = await sites.checkImagesForSite({ host: domain });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Link domain images to subdomain
router.put('/images-domain-to-subdomain', async (request, response, next) => {
  let result;
  try {
    let { domainSiteId, subdomainSiteId } = request.body;
    let sites = new Sites();
    result = await sites.linkDomainImagesToSubdomain({ domainSiteId, subdomainSiteId });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

module.exports = router;
