let { M_Sections } = require(global.ROOT_PATH + '/models/sections.js');
let striptags = require('striptags');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');

module.exports = {
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
      attributes: ['sectionId', 'name', 'priority', 'isHiden'],
      order: [
        ['isHiden', 'ASC'],
        ['priority', 'DESC'],
      ],
    });
    return result;
  },
};
