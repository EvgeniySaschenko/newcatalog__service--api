let express = require('express');
let router = express.Router();
let Ratings = require(global.ROOT_PATH + '/class/ratings');
let Cache = require(global.ROOT_PATH + '/class/cache');
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');

// Получить все рейтинги пользователя
router.get('/', async (req, res, next) => {
  let result;

  try {
    let ratings = new Ratings();
    result = await ratings.getRatings();
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Получить рейтинг
router.get('/:ratingId', async (req, res, next) => {
  let result;

  try {
    let ratings = new Ratings();
    result = await ratings.getRating(req.params);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Добавить рейтинг
router.post('/', async (req, res, next) => {
  let result;

  try {
    let { id: userId } = JSON.parse(req.cookies.user);
    let ratings = new Ratings();
    result = await ratings.createRating({ userId, ...req.body });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Редактировать рейтинг
router.put('/:ratingId', async (req, res, next) => {
  let result;

  try {
    let { id: userId } = JSON.parse(req.cookies.user);
    if (req.body.isHiden) {
      let cache = new Cache();
      result = await cache.deleteCacheRating(req.body);
    }

    let ratings = new Ratings();
    result = await ratings.editRating({ userId, ...req.body });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Удалить рейтинг
router.delete('/:ratingId', async (req, res, next) => {
  let result;
  try {
    let cache = new Cache();
    result = await cache.deleteCacheRating(req.body);
    let ratings = new Ratings();
    result = await ratings.deleteRating(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
