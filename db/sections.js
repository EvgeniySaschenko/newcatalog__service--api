let { M_Sections } = require(global.ROOT_PATH + '/models/sections.js');
let striptags = require('striptags');

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
  async deleteSection({ id }) {
    let result = await M_Sections.destroy({ where: { id } });
    if (result) return true;
    throw Error('Такого id нет');
  },

  // Изменить раздел
  async editSection({ id, name, priority = 0, isHiden }) {
    for (let key in name) {
      name[key] = striptags(name[key]);
    }

    let result = await M_Sections.update({ name, priority, isHiden }, { where: { id } });
    return result;
  },

  // Получить все разделы
  async getSections() {
    let result = await M_Sections.findAll({
      attributes: ['id', 'name', 'priority', 'isHiden'],
      order: [
        ['isHiden', 'ASC'],
        ['priority', 'DESC'],
        ['name', 'ASC'],
      ],
    });
    return result;
  },

  // Получить раздел по id
  async getSectionById({ id }) {
    let result = await M_Sections.findAll({
      attributes: ['id', 'name', 'priority', 'isHiden'],
      where: { id },
    });
    return result[0];
  },

  // Получить все видимые разделы
  async getSectionsVisible() {
    let result = await this.getSections();
    return result.filter((el) => el.isHiden === true);
  },
};
