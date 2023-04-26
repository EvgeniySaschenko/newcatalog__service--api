let express = require('express');
let router = express.Router();
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let Settings = require(global.ROOT_PATH + '/class/settings');

// Get settings
router.get('/', async (request, response, next) => {
  let result;
  try {
    let settings = new Settings();
    result = await settings.getSettings();
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Edit setting
router.put('/:settingName', async (request, response, next) => {
  let result;
  try {
    let settings = new Settings();
    result = await settings.runEditSettingServices(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

module.exports = router;
