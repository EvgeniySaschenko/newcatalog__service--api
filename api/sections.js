let express = require('express');
let router = express.Router();
let Sections = require(global.ROOT_PATH + '/class/sections');
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');

let sections = new Sections();
let errorsMessage = new ErrorsMessage();

// Получить разделы (админ)
router.get('/', async (req, res, next) => {
  // let data = await sections.getSectionsVisible(); - для простых пользователей
  let result;
  try {
    result = await sections.getSections(req.params);
  } catch (error) {
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Добавить раздел
router.post('/', async (req, res, next) => {
  let result;
  try {
    result = await sections.createSection(req.body);
  } catch (error) {
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Удалить раздел
router.delete('/:id', async (req, res, next) => {
  let result;
  try {
    result = await sections.deleteSection(req.params);
  } catch (error) {
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Редактировать раздел
router.put('/', async (req, res, next) => {
  let result;
  try {
    result = await sections.editSection(req.body);
  } catch (error) {
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
