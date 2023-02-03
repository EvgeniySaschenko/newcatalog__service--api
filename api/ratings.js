let express = require('express');
let router = express.Router();
let Ratings = require(global.ROOT_PATH + '/class/ratings');
let RatingsItems = require(global.ROOT_PATH + '/class/ratings-items');
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
    res.status(400);
  }
  res.send(result);
});

// Получить рейтинг
router.get('/:id', async (req, res, next) => {
  let result;
  let ratings = new Ratings();
  let errorsMessage = new ErrorsMessage();
  //let ratingsItems = new RatingsItems();
  // let end = await ratingsItems.updateWhoisAll();
  // console.log(end, "end");

  // await ratingsItems.updateRatingIdFromItems({ ratingIdOld: 20, ratingIdNew: 19 });
  // await ratingsItems.updateRatingIdFromScreensProcessings({ ratingIdOld: 20, ratingIdNew: 19 });

  try {
    result = await ratings.getRating(req.params);
  } catch (error) {
    result = errorsMessage.createMessage(error);
    res.status(400);
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
    res.status(400);
  }
  res.send(result);
});

// Редактировать рейтинг
router.put('/', async (req, res, next) => {
  let result;
  let ratings = new Ratings();
  let errorsMessage = new ErrorsMessage();
  try {
    let { id: userId } = JSON.parse(req.cookies.user);
    result = await ratings.editRating({ userId, ...req.body });
  } catch (error) {
    result = errorsMessage.createMessage(error);
    res.status(400);
  }
  res.send(result);
});

module.exports = router;
