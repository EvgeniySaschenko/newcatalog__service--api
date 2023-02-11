let express = require('express');
let router = express.Router();
let Labels = require(global.ROOT_PATH + '/class/labels');
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');

// Получить ярлыки рейтинга
router.get('/rating/:ratingId', async (req, res, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.getLabels(req.params);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Добавить ярлык
router.post('/', async (req, res, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.createLabel(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Удалить ярлык
router.delete('/:labelId', async (req, res, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.deleteLabel(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Редактировать ярлык
router.put('/:labelId', async (req, res, next) => {
  let result;
  try {
    let labels = new Labels();
    result = await labels.editLabel(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
