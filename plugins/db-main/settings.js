let { M_Settings, name: tableName } = require('./models/settings');

module.exports = {
  tableName,
  //  Create setting
  async createSetting({ settingName, serviceType, settingValue }) {
    let result = await M_Settings.create({ settingName, serviceType, settingValue });
    return result.get({ plain: true });
  },

  // Edit setting (editSettingByType)
  async editSetting({ settingName, serviceType, settingValue }) {
    let result = await M_Settings.update(
      {
        settingValue,
      },
      { where: { settingName, serviceType } }
    );
    return result[0];
  },

  // Get setting by name (getSettingByType)
  async getSettingBySettingNameAndServiceType({ settingName, serviceType }) {
    let result = await M_Settings.findOne({
      where: {
        settingName,
        serviceType,
      },
    });
    return result;
  },

  // Get all settings
  async getSettings() {
    let result = await M_Settings.findAll({
      order: [
        ['settingName', 'DESC'],
        ['serviceType', 'DESC'],
      ],
    });
    return result;
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {},
};
