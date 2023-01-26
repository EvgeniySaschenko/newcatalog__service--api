let express = require("express");
let router = express.Router();
let RatingsLabels = require(ROOT_PATH + "/class/ratings-labels");
let ErrorsMessage = require(ROOT_PATH + "/class/errors-message");

// Получить ярлыки рейтинга
router.get("/rating/:ratingId", async (req, res, next) => {
  let result;
  try {
    let ratingsLabels = new RatingsLabels();
    result = await ratingsLabels.getLabels(req.params);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(400);
  }
  res.send(result);
});

// Добавить ярлык
router.post("/", async (req, res, next) => {
  let result;
  try {
    let ratingsLabels = new RatingsLabels();
    result = await ratingsLabels.createLabel(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(400);
  }
  res.send(result);
});

// Удалить ярлык
router.delete("/:id", async (req, res, next) => {
  let result;
  try {
    let ratingsLabels = new RatingsLabels();
    result = await ratingsLabels.deleteLabel(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(400);
  }
  res.send(result);
});

// Редактировать ярлык
router.put("/:id", async (req, res, next) => {
  let result;
  try {
    let ratingsLabels = new RatingsLabels();
    result = await ratingsLabels.editLabel(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(400);
  }
  res.send(result);
});

module.exports = router;
