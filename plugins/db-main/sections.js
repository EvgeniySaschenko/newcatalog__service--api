let { M_Sections, name: tableName } = require('./models/sections');
let striptags = require('striptags');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');

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
    throw Error($t('There is no such id'));
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
