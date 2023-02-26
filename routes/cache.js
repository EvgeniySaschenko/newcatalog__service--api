let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let Cache = require(global.ROOT_PATH + '/class/cache');

// Create cache
router.post('/create', async (req, res, next) => {
  let result = true;
  try {
    let cache = new Cache();
    result = await cache.runCacheCreate({ isCacheReset: false });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Reset cache
router.post('/reset', async (req, res, next) => {
  let result = true;
  try {
    let cache = new Cache();
    result = await cache.runCacheCreate({ isCacheReset: true });
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

module.exports = router;
