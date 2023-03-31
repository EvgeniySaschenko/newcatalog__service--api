let express = require('express');
let router = express.Router();
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');
let Translations = require(global.ROOT_PATH + '/class/translations');
let { $config } = require(global.ROOT_PATH + '/plugins/config');

// Get settings
router.get('/:typeName', async (req, res, next) => {
  let result;
  try {
    let translations = new Translations();
    result = await translations.getTranslationsForService({
      type: $config['translations'].types[req.params.typeName].type,
      page: Number(req.query.page) || 1,
    });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Create translitions for service
router.post('/create-for-service/:typeName', async (req, res, next) => {
  let result;
  let typeName = req.params.typeName;
  try {
    let translations = new Translations();
    result = await translations.runCreateTranslitions({
      pathRoot: $config['translations'].types[typeName].pathRoot,
      type: $config['translations'].types[typeName].type,
    });
  } catch (error) {
    let errorsMessage = new ErrorsMessage();
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
    let errorsMessage = new ErrorsMessage();
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
