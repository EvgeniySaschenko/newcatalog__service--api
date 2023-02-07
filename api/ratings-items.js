let express = require('express');
let router = express.Router();
let RatingsItems = require(global.ROOT_PATH + '/class/ratings-items');
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let db = require(global.ROOT_PATH + '/db');
let fse = require('fs-extra');

// Получить все елемнты рейтинга
router.get('/rating/:ratingId', async (req, res, next) => {
  let result;

  // await db['sites'].updateSiteScreenshotId();

  try {
    let { typeSort } = req.query;
    let { ratingId } = req.params;
    let ratingsItems = new RatingsItems();

    result = await ratingsItems.getItemsRating({ typeSort, ratingId });

    // let ratingsItemsAll = await db['ratings-items'].getItems();
    // for await (let item of ratingsItemsAll) {
    //   // if (Object.keys(item.whois).length) {
    //   //   fse.writeJson(global.ROOT_PATH + `/cashe/whois/${item.imgId}.json`, item.whois);
    //   // }

    //   db['sites'].updateSiteAlexaRank(item);
    //   // console.log(await db['ratings-items'].getItemByImgId({ imgId: item.imgId }));
    // }
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
