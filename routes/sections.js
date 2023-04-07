let express = require('express');
let router = express.Router();
let Sections = require(global.ROOT_PATH + '/class/sections');
let ErrorsMessage = require(global.ROOT_PATH + '/class/errors-message');

// Get sections
router.get('/', async (req, res, next) => {
  let result;

  try {
    let sections = new Sections();
    result = await sections.getSections(req.params);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Add section
router.post('/', async (req, res, next) => {
  let result;
  try {
    let sections = new Sections();
    result = await sections.createSection(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Delete section
router.delete('/:sectionId', async (req, res, next) => {
  let result;
  try {
    let sections = new Sections();
    result = await sections.deleteSection(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

// Edit Section
router.put('/:sectionId', async (req, res, next) => {
  let result;
  try {
    let sections = new Sections();
    result = await sections.editSection(req.body);
  } catch (error) {
    let errorsMessage = new ErrorsMessage(req);
    result = errorsMessage.createMessage(error);
    res.status(result.status);
  }
  res.send(result);
});

module.exports = router;
