let express = require('express');
let router = express.Router();
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let Backups = require(global.ROOT_PATH + '/class/backups');

// Create backup
router.post('/create', async (request, response, next) => {
  let result;
  try {
    $utils['errors'].serverMessageDemoMode();
    let backups = new Backups();
    result = await backups.createBackup();
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Restore backup
router.post('/restore', async (request, response, next) => {
  let result;
  try {
    $utils['errors'].serverMessageDemoMode();
    let backups = new Backups();
    result = await backups.restoreBackup(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Get backups
router.get('/backups-list', async (request, response, next) => {
  let result;
  try {
    let backups = new Backups();
    result = await backups.getBackupsList({ page: Number(request.query.page) });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Get backups restore
router.get('/restores-list', async (request, response, next) => {
  let result;
  try {
    let backups = new Backups();
    result = await backups.getRestoresList({ page: Number(request.query.page) });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

module.exports = router;
