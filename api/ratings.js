let express = require('express');
let router = express.Router();
let Ratings = require(global.ROOT_PATH + '/class/ratings');
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');

// Получить все рейтинги пользователя
router.get('/user/:userId', async (req, res, next) => {
  let result;
  let ratings = new Ratings();
  let errorsMessage = new ErrorsMessage();
  try {
    let { userId } = req.params;
    result = await ratings.getRatingsUser({ userId });
  } catch (error) {
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Получить рейтинг
router.get('/:ratingId', async (req, res, next) => {
  let result;
  let ratings = new Ratings();
  let errorsMessage = new ErrorsMessage();
  try {
    result = await ratings.getRating(req.params);
  } catch (error) {
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Добавить рейтинг
router.post('/', async (req, res, next) => {
  let result;
  let ratings = new Ratings();
  let errorsMessage = new ErrorsMessage();
  try {
    let { id: userId } = JSON.parse(req.cookies.user);
    result = await ratings.createRating({ userId, ...req.body });
  } catch (error) {
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Редактировать рейтинг
router.put('/:ratingId', async (req, res, next) => {
  let result;
  let ratings = new Ratings();
  let errorsMessage = new ErrorsMessage();
  try {
    let { id: userId } = JSON.parse(req.cookies.user);
    result = await ratings.editRating({ userId, ...req.body });
  } catch (error) {
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
