let express = require('express');
let router = express.Router();
let Labels = require(global.ROOT_PATH + '/class/labels');
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');

// Get rating labels
router.get('/rating/:ratingId', async (req, res, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.getLabelsRating(req.params);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Add label
router.post('/', async (req, res, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.createLabel(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Delete label
router.delete('/:labelId', async (req, res, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.deleteLabel(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Edit Label
router.put('/:labelId', async (req, res, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.editLabel(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
