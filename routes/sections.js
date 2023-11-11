let express = require('express');
let router = express.Router();
let Sections = require(global.ROOT_PATH + '/class/sections');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

// Get sections
router.get('/', async (request, response, next) => {
  let result;

  try {
    let sections = new Sections();
    result = await sections.getSections(request.params);
    $utils['common'].createFileCacheAdmin({
      filePath: `sections.json`,
      data: result,
    });
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Add section
router.post('/', async (request, response, next) => {
  let result;
  try {
    let sections = new Sections();
    result = await sections.createSection(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Delete section
router.delete('/:sectionId', async (request, response, next) => {
  let result;
  try {
    let sections = new Sections();
    result = await sections.deleteSection(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

// Edit Section
router.put('/:sectionId', async (request, response, next) => {
  let result;
  try {
    let sections = new Sections();
    result = await sections.editSection(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

module.exports = router;
