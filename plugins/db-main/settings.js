let { name: tableName } = require('./models/settings');
let { $dbMainConnect } = require('./models/_db');

module.exports = {
  tableName,
  //  Create setting
  async createSetting({ settingName, serviceType, settingValue }) {
    let result = await $dbMainConnect.models['settings'].create({
      settingName,
      serviceType,
      settingValue,
    });
    return result.get({ plain: true });
  },

  // Edit setting (editSettingByType)
  async editSetting({ settingName, serviceType, settingValue }) {
    let result = await $dbMainConnect.models['settings'].update(
      {
        settingValue,
      },
      { where: { settingName, serviceType } }
    );
    return result[0];
  },

  // Get setting by name (getSettingByType)
  async getSettingBySettingNameAndServiceType({ settingName, serviceType }) {
    let result = await $dbMainConnect.models['settings'].findOne({
      where: {
        settingName,
        serviceType,
      },
    });
    return result;
  },

  // Get all settings
  async getSettings() {
    let result = await $dbMainConnect.models['settings'].findAll({
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
