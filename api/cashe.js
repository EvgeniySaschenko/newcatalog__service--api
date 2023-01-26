let express = require("express");
let router = express.Router();
let Sections = require(ROOT_PATH + "/class/sections");
let Ratings = require(ROOT_PATH + "/class/ratings");
let RatingsLabels = require(ROOT_PATH + "/class/ratings-labels");
let RatingsItems = require(ROOT_PATH + "/class/ratings-items");

let ErrorsMessage = require(ROOT_PATH + "/class/errors-message");

router.get("/", async (req, res, next) => {
  let result = true;
  try {
    let ratings = new Ratings();
    let sections = new Sections();
    let ratingsLabels = new RatingsLabels();
    let ratingsItems = new RatingsItems();
    await sections.createCache();
    await ratings.createCache();
    await ratingsLabels.createCache();
    await ratingsItems.createCache();
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
  }
  res.send(result);
});

module.exports = router;
