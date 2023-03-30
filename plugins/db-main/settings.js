let { M_Settings, name: tableName } = require('./models/settings');

module.exports = {
  tableName,
  //  Create setting
  async createSetting({ name, value }) {
    let result = await M_Settings.create({ name, value });
    return result.get({ plain: true });
  },

  // Edit setting
  async editSettingByName({ name, value }) {
    let result = await M_Settings.update(
      {
        value,
      },
      { where: { name } }
    );
    return result[0];
  },

  // Get setting by name
  async getSettingByName({ name }) {
    let result = await M_Settings.findOne({
      where: {
        name,
      },
    });
    return result;
  },

  // Get all settings
  async getSettings() {
    let result = await M_Settings.findAll({
      order: [['name', 'DESC']],
    });
    return result;
  },
};
