let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

class Sections {
  // Create section
  async createSection({ name }) {
    let { sectionId } = await $dbMain['sections'].createSection({ name });
    return { sectionId };
  }

  // Delete section
  async deleteSection({ sectionId }) {
    let ratingsCount = await $dbMain['ratings'].getRatingCountBySectionId({ sectionId });

    if (ratingsCount) {
      $utils['errors'].validationMessage({
        path: 'section',
        message: $t('You can not delete a section that has ratings'),
      });
    }

    let tableRecord = await $dbMain['sections'].getSectionBySectionId({ sectionId });
    await $dbMain['records-deleted'].createRecords({
      tableName: $dbMain['sections'].tableName,
      tableId: sectionId,
      tableRecord,
    });

    let result = await $dbMain['sections'].deleteSection({ sectionId });
    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Edit section
  async editSection(section = {}) {
    let result = await $dbMain['sections'].editSection(section);
    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Get all sections
  async getSections() {
    return await $dbMain['sections'].getSections();
  }
}

module.exports = Sections;
