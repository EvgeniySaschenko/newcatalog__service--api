let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $t, $translations } = require(global.ROOT_PATH + '/plugins/translations');
let langsMap = require('langs');

class Settings {
  // Init settings default
  async initSettingsDefault() {
    for await (let [type, value] of Object.entries(global.$config['settings'])) {
      let result = await this.createSetting({ type, value });
      let serviceAdmin = global.$config['services'].admin;
      let serviceSite = global.$config['services'].site;
      // Lang default admin
      if (result.type === serviceAdmin.settingNameLangDefault) {
        $translations.setLangDefault({ serviceName: serviceAdmin.serviceName, lang: result.value });
      }

      // Lang default site
      if (result.type === serviceSite.settingNameLangDefault) {
        $translations.setLangDefault({ serviceName: serviceSite.serviceName, lang: result.value });
      }

      // Langs admin
      if (result.type === serviceAdmin.settingNameLangs) {
        $translations.setLangs({ serviceName: serviceAdmin.serviceName, langs: result.value });
      }

      // Langs site
      if (result.type === serviceSite.settingNameLangs) {
        $translations.setLangs({ serviceName: serviceSite.serviceName, langs: result.value });
      }
    }
  }

  // Create setting
  async createSetting({ type, value }) {
    let setting = await $dbMain['settings'].getSettingByType({ type });
    if (!setting) {
      setting = await $dbMain['settings'].createSetting({ type, value });
    }

    return setting;
  }

  // Edit lang default
  async editLangDefault({ type, lang }) {
    // not valid lang
    if (!langsMap.has('1', lang)) {
      throw { server: $t('Server error') };
    }
    let serviceName;
    let serviceAdmin = global.$config['services'].admin;
    let serviceSite = global.$config['services'].site;

    // check in list langs
    switch (type) {
      case serviceSite.settingNameLangDefault: {
        serviceName = serviceSite.serviceName;
        let langs = await $dbMain['settings'].getSettingByType({
          type: serviceSite.settingNameLangs,
        });
        let isExistLang = langs.value.includes(lang);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: serviceSite.settingNameLangDefault,
                message: $t('First you need to add the language to the general list'),
              },
            ],
          };
        }
        break;
      }
      case serviceAdmin.settingNameLangDefault: {
        serviceName = serviceAdmin.serviceName;
        let langs = await $dbMain['settings'].getSettingByType({
          type: serviceAdmin.settingNameLangs,
        });
        let isExistLang = langs.value.includes(lang);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: serviceAdmin.settingNameLangDefault,
                message: $t('First you need to add the language to the general list'),
              },
            ],
          };
        }
        break;
      }
      default: {
        throw { server: $t('Server error') };
      }
    }

    let result = await $dbMain['settings'].editSettingByType({ type, value: lang });
    $translations.setLangDefault({ serviceName, lang });

    if (!result) {
      throw { server: $t('Server error') };
    }
    return true;
  }

  // Edit langs list
  async editLangsList({ type, langs }) {
    let serviceName;
    let serviceAdmin = global.$config['services'].admin;
    let serviceSite = global.$config['services'].site;

    // not valid lang
    for (let lang of langs) {
      if (!langsMap.has('1', lang)) {
        throw { server: $t('Server error') };
      }
    }

    // check in list langs
    switch (type) {
      case serviceSite.settingNameLangs: {
        serviceName = serviceSite.serviceName;
        let lang = await $dbMain['settings'].getSettingByType({
          type: serviceSite.settingNameLangDefault,
        });
        let isExistLang = langs.includes(lang.value);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: serviceSite.settingNameLangs,
                message: $t('The list should include the default language'),
              },
            ],
          };
        }
        break;
      }
      case serviceAdmin.settingNameLangs: {
        serviceName = serviceAdmin.serviceName;
        let lang = await $dbMain['settings'].getSettingByType({
          type: serviceAdmin.settingNameLangDefault,
        });
        let isExistLang = langs.includes(lang.value);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: serviceAdmin.settingNameLangs,
                message: $t('The list should include the default language'),
              },
            ],
          };
        }
        break;
      }
      default: {
        throw { server: $t('Server error') };
      }
    }

    let result = await $dbMain['settings'].editSettingByType({ type, value: langs });
    $translations.setLangs({ serviceName, langs });

    if (!result) {
      throw { server: $t('Server error') };
    }

    return true;
  }

  // Get settings
  async getSettings() {
    let result = await $dbMain['settings'].getSettings();
    let settings = {};
    for (let { type, value } of result) {
      settings[type] = value;
    }

    let langsIso = langsMap.all().map((el) => {
      return {
        name: el.name,
        code: el['1'],
      };
    });

    return {
      settings,
      langsIso,
    };
  }
}

module.exports = Settings;
