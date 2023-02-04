let express = require('express');
let router = express.Router();
let RatingsItems = require(global.ROOT_PATH + '/class/ratings-items');
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let SiteScreen = require(global.ROOT_PATH + '/class/site-screen');
let SiteLogo = require(global.ROOT_PATH + '/class/site-logo');

// Получить все елемнты рейтинга
router.get('/rating/:ratingId', async (req, res, next) => {
  let result;

  try {
    let { typeSort } = req.query;
    let { ratingId } = req.params;
    let ratingsItems = new RatingsItems();

    result = await ratingsItems.getItems({ typeSort, ratingId });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Елементы рейтинга для которых есть скриншоты, которые нужно обработать
router.get('/sites-screens/:ratingId', async (req, res, next) => {
  let result;
  try {
    let { ratingId } = req.params;
    let siteScreen = new SiteScreen();

    result = await siteScreen.getReadyScreensSitesForRating({ ratingId });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Логотип сайта
router.put('/sites-logos', async (req, res, next) => {
  let result;
  try {
    let siteLogo = new SiteLogo();
    result = await siteLogo.init(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Обновить елементы рейтинга
router.put('/labels', async (req, res, next) => {
  let result;

  // let ratingsItems = new RatingsItems();
  // for (let key in req.body.labelsItems) {
  //   console.log(key);
  //   let item = await ratingsItems.getItemRatingById({ id: key });
  //   await ratingsItems.updateRatingIdFromItemById({ itemId: key, ratingIdNew: 32 });
  //   await ratingsItems.updateRatingIdFromScreenProcessingByImgIdAndItemId({
  //     ratingIdOld: 26,
  //     ratingIdNew: 32,
  //     imgId: item.imgId,
  //   });
  //   console.log(item.imgId);
  // }

  //ratingsItems.updateRatingIdFromItems({ ratingIdOld, ratingIdNew });

  try {
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.editLabelsItems(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Добавить елемент рейтинга
router.post('/', async (req, res, next) => {
  let result;
  try {
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.createItem(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Редактировать елемент рейтинга
router.put('/:id', async (req, res, next) => {
  let result;

  try {
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.editItem(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Удалить елемент рейтинга
router.delete('/:id', async (req, res, next) => {
  let result;
  try {
    let ratingsItems = new RatingsItems();
    result = await ratingsItems.deleteItem(req.params);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
