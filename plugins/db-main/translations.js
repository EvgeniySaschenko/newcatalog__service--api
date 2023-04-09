let { M_Translations, name: tableName } = require('./models/translations');

module.exports = {
  tableName,
  // Create translation
  async createTranslationKey({ key, serviceType }) {
    let result = await M_Translations.create({ key, serviceType });
    return result.get({ plain: true });
  },

  // Get translation by key and type
  async getTranslationByKeyAndType({ key, serviceType }) {
    return await M_Translations.findOne({
      where: {
        key,
        serviceType,
      },
    });
  },

  // Get translations count by serviceType
  async getTranslationsCountByType({ serviceType }) {
    let result = await M_Translations.count({
      where: {
        serviceType,
      },
    });
    return result;
  },

  // Get translation by serviceType
  async getTranslationsByType({ serviceType, offset, limit }) {
    let result = await M_Translations.findAll({
      where: {
        serviceType,
      },
      order: [['key', 'ASC']],
      offset,
      limit,
    });
    return result;
  },

  // Update translation by id
  async editTextById({ translationId, text }) {
    let result = await M_Translations.update(
      {
        text,
      },
      { where: { translationId } }
    );
    return result[0];
  },

  // Delete translation by key and serviceType
  async deleteTranslationByKeyAndType({ key, serviceType }) {
    return await M_Translations.destroy({ where: { key, serviceType } });
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {
    let all = await M_Translations.findAll();

    for await (let item of all) {
      let ua = item.text['ua'];
      item.text['uk'] = ua;
      delete item.text['ua'];
      await M_Translations.update(
        { text: item.text },
        { where: { translationId: item.translationId } }
      );
    }
  },
};
