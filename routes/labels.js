let express = require('express');
let router = express.Router();
let Labels = require(global.ROOT_PATH + '/class/labels');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

// Get rating labels
router.get('/rating/:ratingId', async (request, response, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.getLabelsRating(request.params);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Add label
router.post('/', async (request, response, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.createLabel(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Delete label
router.delete('/:labelId', async (request, response, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.deleteLabel(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Edit Label
router.put('/:labelId', async (request, response, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.editLabel(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

module.exports = router;
