let { M_Translations, name: tableName } = require('./models/translations');

module.exports = {
  tableName,
  // Create translation
  async createTranslationKey({ key, type }) {
    let result = await M_Translations.create({ key, type });
    return result.get({ plain: true });
  },

  // Get translation by key and type
  async getTranslationByKeyAndType({ key, type }) {
    return await M_Translations.findOne({
      where: {
        key,
        type,
      },
    });
  },

  // Get translations count by type
  async getTranslationsCountByType({ type }) {
    let result = await M_Translations.count({
      where: {
        type,
      },
    });
    return result;
  },

  // Get translation by type
  async getTranslationsByType({ type, offset, limit }) {
    let result = await M_Translations.findAll({
      where: {
        type,
      },
      order: [['key', 'ASC']],
      offset,
      limit,
    });
    return result;
  },

  // Update translation by id
  async updateTextById({ translationId, text }) {
    let result = await M_Translations.update(
      {
        text,
      },
      { where: { translationId } }
    );
    return result[0];
  },

  // Delete translation by key and type
  async deleteTranslationByKeyAndType({ key, type }) {
    return await M_Translations.destroy({ where: { key, type } });
  },
};
