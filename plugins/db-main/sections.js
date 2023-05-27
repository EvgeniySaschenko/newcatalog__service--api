let { name: tableName } = require('./models/sections');
let { $dbMainConnect } = require('./models/_db');

module.exports = {
  tableName,
  // Create section
  async createSection({ name, descr, priority, isHiden }) {
    let result = await $dbMainConnect.models['sections'].create({ name, descr, priority, isHiden });
    return result.get({ plain: true });
  },

  // Delete section
  async deleteSection({ sectionId }) {
    return await $dbMainConnect.models['sections'].destroy({ where: { sectionId } });
  },

  // Edit section
  async editSection({ sectionId, name, descr, priority, isHiden }) {
    let result = await $dbMainConnect.models['sections'].update(
      { name, descr, priority, isHiden },
      { where: { sectionId } }
    );
    return result[0];
  },

  // Get all sections
  async getSections() {
    let result = await $dbMainConnect.models['sections'].findAll({
      order: [
        ['priority', 'DESC'],
        ['dateCreate', 'DESC'],
      ],
    });
    return result;
  },

  // Get section by SectionId
  async getSectionBySectionId({ sectionId }) {
    let result = await $dbMainConnect.models['sections'].findOne({
      where: {
        sectionId,
      },
    });
    return result;
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {
    let all = await $dbMainConnect.models['sections'].findAll();

    for await (let item of all) {
      let ua = item.name['ua'];
      item.name['uk'] = ua;
      delete item.name['ua'];
      await $dbMainConnect.models['sections'].update(
        { name: item.name },
        { where: { sectionId: item.sectionId } }
      );
    }
  },
};
