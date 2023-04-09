let { M_Settings, name: tableName } = require('./models/settings');

module.exports = {
  tableName,
  //  Create setting
  async createSetting({ type, value }) {
    let result = await M_Settings.create({ type, value });
    return result.get({ plain: true });
  },

  // Edit setting
  async editSettingByType({ type, value }) {
    let result = await M_Settings.update(
      {
        value,
      },
      { where: { type } }
    );
    return result[0];
  },

  // Get setting by name
  async getSettingByType({ type }) {
    let result = await M_Settings.findOne({
      where: {
        type,
      },
    });
    return result;
  },

  // Get all settings
  async getSettings() {
    let result = await M_Settings.findAll({
      order: [['type', 'DESC']],
    });
    return result;
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {},
};
