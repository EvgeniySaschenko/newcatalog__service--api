let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let Settings = require(global.ROOT_PATH + '/class/settings');

// Get settings
router.get('/', async (req, res, next) => {
  let result;
  try {
    let settings = new Settings();
    result = await settings.getSettings();
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Edit lang default
router.put('/lang-default', async (req, res, next) => {
  let result;
  try {
    let settings = new Settings();
    result = await settings.editLangDefault(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Edit langs list
router.put('/langs-list', async (req, res, next) => {
  let result;
  try {
    let settings = new Settings();
    result = await settings.editLangsList(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
