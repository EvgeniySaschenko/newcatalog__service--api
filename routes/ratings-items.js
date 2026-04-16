let express = require('express');
let router = express.Router();
let RatingsItems = require(global.ROOT_PATH + '/class/ratings-items');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

// Get all rating items
router.get('/rating/:ratingId', async (request, response, next) => {
  let result;

  try {
    let { typeSort } = request.query;
    let { ratingId } = request.params;
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.getItemsRating({ typeSort, ratingId });
    $utils['common'].createFileCacheAdmin({
      filePath: `rating/ratings-items/${ratingId}.json`,
      data: result,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Add rating item
router.post('/', async (request, response, next) => {
  let result;
  try {
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.createItem(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Edit rating item
router.put('/:ratingItemId', async (request, response, next) => {
  let result;

  try {
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.editItem(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Delete the rating item
router.delete('/:ratingItemId', async (request, response, next) => {
  let result;
  try {
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.deleteItem(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

module.exports = router;
