let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let Translations = require(global.ROOT_PATH + '/class/translations');

// Get part translations for service
router.get('/part-list', async (req, res, next) => {
  let result;
  let serviceName = req.query.serviceName;
  try {
    let translations = new Translations();
    let { serviceType } = global.$config['services'][serviceName];

    result = await translations.getTranslationsForService({
      serviceType,
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
  try {
    let translations = new Translations();
    let { serviceName, serviceType } = global.$config['services'][req.query.serviceName];

    result = await translations.getTranslationsForFunctionTranslate({
      serviceName,
      serviceType,
    });
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
  let serviceName = req.body.serviceName;

  try {
    let translations = new Translations();
    let { serviceRootPath, serviceType } = global.$config['services'][serviceName];
    result = await translations.runCreateTranslations({
      serviceRootPath,
      serviceType,
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
    result = await translations.runEditText(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
