let express = require('express');
let router = express.Router();
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let Cache = require(global.ROOT_PATH + '/class/cache');

// Add cache rating
router.post('/rating/:ratingId', async (request, response, next) => {
  let result = true;
  try {
    let cache = new Cache();
    await cache.deleteCacheId();
    result = await cache.createCacheRating(request.body);
    await cache.setCacheId();
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Delete cache rating
router.delete('/rating/:ratingId', async (request, response, next) => {
  let result = true;
  try {
    let cache = new Cache();
    await cache.deleteCacheId();
    result = await cache.deleteCacheRating(request.body);
    await cache.setCacheId();
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Create new cache from all
router.post('/reset-all', async (request, response, next) => {
  let result = true;
  $utils['service'].blockService();
  try {
    let cache = new Cache();
    await cache.deleteCacheId();
    result = await cache.resetCacheAll(request.body);
    await cache.setCacheId();
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  } finally {
    $utils['service'].unblockService();
  }

  response.send(result);
});

// Clear database
router.delete('/clear-all', async (request, response, next) => {
  let result = true;
  $utils['service'].blockService();
  try {
    let cache = new Cache();
    result = await cache.clearCacheAll();
    // No identifier indicates no cache
    // if (result) {
    //   result = await cache.setCacheId();
    // }
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  } finally {
    $utils['service'].unblockService();
  }

  response.send(result);
});

// Create cache sections
router.post('/sections', async (request, response, next) => {
  let result = true;
  try {
    let cache = new Cache();
    await cache.deleteCacheId();
    result = await cache.createCacheSections();
    await cache.setCacheId();
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Create cache settings
router.post('/settings', async (request, response, next) => {
  let result = true;
  try {
    let cache = new Cache();
    await cache.deleteCacheId();
    result = await cache.createCacheSettings();
    await cache.setCacheId();
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});
module.exports = router;
