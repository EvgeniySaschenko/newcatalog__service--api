let express = require('express');
let router = express.Router();
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let Backups = require(global.ROOT_PATH + '/class/backups');

// Run process backup
router.post('/run', async (request, response, next) => {
  let result;
  try {
    let backups = new Backups();
    result = await backups.runProcessBackup();
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Get backups
router.get('/', async (request, response, next) => {
  let result;
  try {
    let backups = new Backups();
    result = await backups.getBackups({ page: Number(request.query.page) });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

module.exports = router;
