let { M_Sections, name: tableName } = require(global.ROOT_PATH + '/models/sections.js');
let striptags = require('striptags');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');

module.exports = {
  tableName,
  // Создать раздел
  async createSection({ name }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }

    let result = await M_Sections.create({ name });
    return result.get({ plain: true });
  },

  // Удалить раздел
  async deleteSection({ sectionId }) {
    let result = await M_Sections.destroy({ where: { sectionId } });
    if (result) return true;
    throw Error($errors['There is no such id']);
  },

  // Изменить раздел
  async editSection({ sectionId, name, priority = 0, isHiden }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }

    let result = await M_Sections.update({ name, priority, isHiden }, { where: { sectionId } });
    return result;
  },

  // Получить все разделы
  async getSections() {
    let result = await M_Sections.findAll({
      attributes: ['sectionId', 'name', 'priority', 'isHiden', 'dateCreate'],
      order: [
        ['priority', 'DESC'],
        ['dateCreate', 'DESC'],
      ],
    });
    return result;
  },

  // Получить раздел по id
  async getSectionBySectionId({ sectionId }) {
    let result = await M_Sections.findOne({
      where: {
        sectionId,
      },
    });
    return result;
  },
};