let express = require('express');
let router = express.Router();
let Ratings = require(global.ROOT_PATH + '/class/ratings');
let Cache = require(global.ROOT_PATH + '/class/cache');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

// Get all user ratings
router.get('/', async (request, response, next) => {
  let result;

  try {
    let ratings = new Ratings();
    result = await ratings.getRatings(request);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Get rating
router.get('/:ratingId', async (request, response, next) => {
  let result;

  try {
    let ratings = new Ratings();
    result = await ratings.getRating(request.params);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Add rating
router.post('/', async (request, response, next) => {
  let result;

  try {
    let ratings = new Ratings();
    result = await ratings.createRating({
      token: request.cookies[global.$config['users'].cookieToken] || '',
      ...request.body,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Edit rating
router.put('/:ratingId', async (request, response, next) => {
  let result;

  try {
    if (request.body.isHiden) {
      let cache = new Cache();
      result = await cache.deleteCacheRating(request.body);
    }

    let ratings = new Ratings();
    result = await ratings.editRating({
      token: request.cookies[global.$config['users'].cookieToken] || '',
      ...request.body,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Delete the rating
router.delete('/:ratingId', async (request, response, next) => {
  let result;
  try {
    let cache = new Cache();
    result = await cache.deleteCacheRating(request.body);
    let ratings = new Ratings();
    result = await ratings.deleteRating(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

module.exports = router;
