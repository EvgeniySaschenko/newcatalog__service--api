let express = require('express');
let router = express.Router();
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let Translations = require(global.ROOT_PATH + '/class/translations');

// Get part translations for service
router.get('/part-list', async (request, response, next) => {
  let result;
  let serviceName = request.query.serviceName;
  try {
    let translations = new Translations();
    let { serviceType } = global.$config['services'][serviceName];

    result = await translations.getTranslationsForService({
      serviceType,
      page: Number(request.query.page) || 1,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Get translations for function translate
router.get('/function-translate', async (request, response, next) => {
  let result;
  try {
    let translations = new Translations();
    let { serviceName, serviceType } = global.$config['services'][request.query.serviceName];

    result = await translations.getTranslationsForFunctionTranslate({
      serviceName,
      serviceType,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Create translations for service
router.post('/create-for-service', async (request, response, next) => {
  let result;
  let serviceName = request.body.serviceName;

  try {
    let translations = new Translations();
    let { serviceRootPath, serviceType } = global.$config['services'][serviceName];
    result = await translations.runCreateTranslations({
      serviceRootPath,
      serviceType,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Update text for translation
router.put('/text/:translationId', async (request, response, next) => {
  let result;
  try {
    let translations = new Translations();
    result = await translations.runEditText(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

module.exports = router;
