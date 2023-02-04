let db = require(global.ROOT_PATH + '/db');
let fse = require('fs-extra');

class Sections {
  // Создать раздел
  async createSection({ name }) {
    return await db.sections.createSection({ name });
  }

  // Удалить раздел
  async deleteSection({ id }) {
    return await db.sections.deleteSection({ id });
  }

  // Изменить раздел
  async editSection(section = {}) {
    return await db.sections.editSection(section);
  }

  // Получить все разделы
  async getSections() {
    return await db.sections.getSections();
  }

  // Создать кеш списка разделов в которых есть рейтинги + они не скрыты
  async createCache() {
    let sections = await this.getSections();
    sections = sections.filter((el) => !el.isHiden);
    for (let item of sections) {
      item.ratingsCount = await db.ratings.getRatingCountBySectionId({ sectionId: item.id });
    }
    sections = sections.filter((el) => el.ratingsCount && !el.isHiden);
    fse.writeJson(global.ROOT_PATH + '/cashe/sections.json', sections);
  }
}

module.exports = Sections;
