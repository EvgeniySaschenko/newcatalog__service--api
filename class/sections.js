let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');
let fse = require('fs-extra');

class Sections {
  // Создать раздел
  async createSection({ name }) {
    return await $dbMain['sections'].createSection({ name });
  }

  // Удалить раздел
  async deleteSection({ sectionId }) {
    let ratingsCount = await $dbMain['ratings'].getRatingCountBySectionId({ sectionId });

    if (ratingsCount) {
      throw {
        errors: [
          { path: 'section', message: $errors['You can not delete a section that has ratings'] },
        ],
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

  // Изменить раздел
  async editSection(section = {}) {
    return await $dbMain['sections'].editSection(section);
  }

  // Получить все разделы
  async getSections() {
    return await $dbMain['sections'].getSections();
  }

  // Создать кеш списка разделов в которых есть рейтинги + они не скрыты
  async createCache() {
    let sections = await this.getSections();
    sections = sections.filter((el) => !el.isHiden);
    for (let item of sections) {
      item.ratingsCount = await $dbMain['ratings'].getRatingCountBySectionId({
        sectionId: item.sectionId,
      });
    }
    sections = sections.filter((el) => el.ratingsCount && !el.isHiden);
    fse.writeJson(global.ROOT_PATH + '/cashe/sections.json', sections);
  }
}

module.exports = Sections;
