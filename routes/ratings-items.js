let express = require('express');
let router = express.Router();
let RatingsItems = require(global.ROOT_PATH + '/class/ratings-items');
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');

// Get all rating items
router.get('/rating/:ratingId', async (req, res, next) => {
  let result;

  try {
    let { typeSort } = req.query;
    let { ratingId } = req.params;
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.getItemsRating({ typeSort, ratingId });
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Add rating item
router.post('/', async (req, res, next) => {
  let result;
  try {
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.createItem(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Edit rating item
router.put('/:ratingItemId', async (req, res, next) => {
  let result;

  try {
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.editItem(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Delete the rating item
router.delete('/:ratingItemId', async (req, res, next) => {
  let result;
  try {
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.deleteItem(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
