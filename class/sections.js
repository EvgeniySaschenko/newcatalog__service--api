let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');

class Sections {
  // Create section
  async createSection({ name }) {
    return await $dbMain['sections'].createSection({ name });
  }

  // Delete section
  async deleteSection({ sectionId }) {
    let ratingsCount = await $dbMain['ratings'].getRatingCountBySectionId({ sectionId });

    if (ratingsCount) {
      throw {
        errors: [{ path: 'section', message: $t('You can not delete a section that has ratings') }],
      };
    }

    let tableRecord = await $dbMain['sections'].getSectionBySectionId({ sectionId });
    await $dbMain['records-deleted'].createRecords({
      tableName: $dbMain['sections'].tableName,
      tableId: sectionId,
      tableRecord,
    });

    return await $dbMain['sections'].deleteSection({ sectionId });
  }

  // Edit section
  async editSection(section = {}) {
    return await $dbMain['sections'].editSection(section);
  }

  // Get all sections
  async getSections() {
    return await $dbMain['sections'].getSections();
  }
}

module.exports = Sections;
