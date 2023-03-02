let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let Cache = require(global.ROOT_PATH + '/class/cache');

// Add cache rating
router.post('/rating/:ratingId', async (req, res, next) => {
  let result = true;
  try {
    let cache = new Cache();
    result = await cache.createCacheRating(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Delete cache rating
router.delete('/rating/:ratingId', async (req, res, next) => {
  let result = true;
  try {
    let cache = new Cache();
    result = await cache.deleteCacheRating(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Create new cache from all
router.post('/reset-all', async (req, res, next) => {
  let result = true;
  try {
    let cache = new Cache();
    result = await cache.resetCache(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Clear database
router.delete('/clear-all', async (req, res, next) => {
  let result = true;
  try {
    let cache = new Cache();
    result = await cache.clearDatabase();
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Create cache sections
router.post('/sections', async (req, res, next) => {
  let result = true;
  try {
    let cache = new Cache();
    result = await cache.createCacheSections();
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});
module.exports = router;
