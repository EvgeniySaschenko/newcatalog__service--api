let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let Translations = require(global.ROOT_PATH + '/class/translations');
let { $config } = require(global.ROOT_PATH + '/plugins/config');

// Get part translations for service
router.get('/part-list', async (req, res, next) => {
  let result;
  let serviceTypeName = req.query.serviceTypeName;
  try {
    let translations = new Translations();
    result = await translations.getTranslationsForService({
      serviceType: $config['services'][serviceTypeName].type,
      page: Number(req.query.page) || 1,
    });
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Get translations for function translate
router.get('/function-translate', async (req, res, next) => {
  let result;
  let serviceTypeName = req.query.serviceTypeName;
  try {
    let translations = new Translations();
    result = await translations.getTranslationsForFunctionTranslate({ serviceTypeName });
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Create translations for service
router.post('/create-for-service', async (req, res, next) => {
  let result;
  let serviceTypeName = req.body.serviceTypeName;

  try {
    let translations = new Translations();
    result = await translations.runCreateTranslations({
      serviceRootRath: $config['services'][serviceTypeName].rootPath,
      serviceType: $config['services'][serviceTypeName].type,
    });
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Update text for translation
router.put('/text/:translationId', async (req, res, next) => {
  let result;
  try {
    let translations = new Translations();
    result = await translations.updateText(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
