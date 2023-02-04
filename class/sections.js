let db = require(global.ROOT_PATH + '/db');

let Ratings = require(global.ROOT_PATH + '/class/ratings.js');
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
  async editSection({ id, name, priority, isHiden }) {
    return await db.sections.editSection({ id, name, priority, isHiden });
  }

  // Получить все разделы
  async getSections() {
    return await db.sections.getSections();
  }

  // Получить раздел по id
  async getSectionById({ id }) {
    return await db.sections.getSectionById({ id });
  }

  // Создать кеш для прода
  async createCache() {
    let ratings = new Ratings();

    let sections = await this.getSections();
    sections = sections.filter((el) => !el.isHiden);
    for (let item of sections) {
      item.ratingsCount = await ratings.getRatingCountBySectionId({ sectionId: item.id });
    }
    sections = sections.filter((el) => el.ratingsCount);
    fse.writeJson(global.ROOT_PATH + '/cashe/sections.json', sections);
  }
}

module.exports = Sections;
