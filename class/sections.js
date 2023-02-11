let plugins = require(global.ROOT_PATH + '/plugins');
let fse = require('fs-extra');

class Sections {
  // Создать раздел
  async createSection({ name }) {
    return await plugins['db-main'].sections.createSection({ name });
  }

  // Удалить раздел
  async deleteSection({ sectionId }) {
    return await plugins['db-main'].sections.deleteSection({ sectionId });
  }

  // Изменить раздел
  async editSection(section = {}) {
    return await plugins['db-main'].sections.editSection(section);
  }

  // Получить все разделы
  async getSections() {
    return await plugins['db-main'].sections.getSections();
  }

  // Создать кеш списка разделов в которых есть рейтинги + они не скрыты
  async createCache() {
    let sections = await this.getSections();
    sections = sections.filter((el) => !el.isHiden);
    for (let item of sections) {
      item.ratingsCount = await plugins['db-main'].ratings.getRatingCountBySectionId({
        sectionId: item.sectionId,
      });
    }
    sections = sections.filter((el) => el.ratingsCount && !el.isHiden);
    fse.writeJson(global.ROOT_PATH + '/cashe/sections.json', sections);
  }
}

module.exports = Sections;
