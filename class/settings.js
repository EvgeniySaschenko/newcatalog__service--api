let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { $t, $translations } = require(global.ROOT_PATH + '/plugins/translations');
let langsMap = require('langs');

class Settings {
  // Init settings default
  async initSettingsDefault() {
    let settings = global.$config['settings'];
    let settingsNames = global.$config['settings-names'];
    let services = global.$config['services'];
    // Lang default
    for await (let [serviceName, settingValue] of Object.entries(settings.langDefault)) {
      let serviceType = services[serviceName].serviceType;
      let settingName = settingsNames.langDefault;
      let result = await this.createSetting({ settingName, serviceType, settingValue });
      $translations.setLangDefault({ serviceName, langDefault: result.settingValue });
    }

    // Langs
    for await (let [serviceName, settingValue] of Object.entries(settings.langs)) {
      let serviceType = services[serviceName].serviceType;
      let settingName = settingsNames.langs;
      let result = await this.createSetting({ settingName, serviceType, settingValue });
      $translations.setLangs({ serviceName, langs: result.settingValue });
    }
  }

  // Create setting
  async createSetting({ settingName, serviceType, settingValue }) {
    let setting = await $dbMain['settings'].getSettingBySettingNameAndServiceType({
      settingName,
      serviceType,
    });
    if (!setting) {
      setting = await $dbMain['settings'].createSetting({ settingName, serviceType, settingValue });
    }
    return setting;
  }

  // Edit setting
  async editSetting({ settingName, serviceName, settingValue }) {
    let settingsNames = global.$config['settings-names'];
    let services = global.$config['services'];
    let serviceType = services[serviceName].serviceType;

    switch (settingName) {
      // lang default
      case settingsNames.langDefault: {
        let langDefault = settingValue;
        await this.editLangDefault({ settingName, serviceType, langDefault });
        break;
      }

      // langs
      case settingsNames.langs: {
        let langs = settingValue;
        await this.editLangs({ settingName, serviceType, langs });
        break;
      }

      default: {
        $utils['errors'].serverMessage();
      }
    }

    return true;
  }

  // Edit lang default
  async editLangDefault({ settingName, serviceType, langDefault }) {
    let settingsNames = global.$config['settings-names'];
    let servicesTypes = global.$config['services-types'];

    // not valid lang
    if (!langsMap.has('1', langDefault)) {
      $utils['errors'].serverMessage($t('Not valid lang'));
    }

    // Get langs for service
    let sttingLangs = await $dbMain['settings'].getSettingBySettingNameAndServiceType({
      settingName: settingsNames.langs,
      serviceType,
    });

    if (!sttingLangs) {
      $utils['errors'].serverMessage($t('Not valid setting'));
    }

    // Check in list langs
    let isExistLang = sttingLangs.settingValue.includes(langDefault);
    if (!isExistLang) {
      $utils['errors'].validationMessage({
        path: `${servicesTypes[serviceType].serviceName}--${settingsNames.langDefault}`,
        message: $t('First you need to add the language to the general list'),
      });
    }

    let reusult = await $dbMain['settings'].editSetting({
      settingName,
      serviceType,
      settingValue: langDefault,
    });

    if (!reusult) {
      $utils['errors'].serverMessage();
    }

    let serviceName = servicesTypes[serviceType].serviceName;
    return $translations.setLangDefault({ serviceName, langDefault });
  }

  // Edit langs list
  async editLangs({ settingName, serviceType, langs }) {
    let settingsNames = global.$config['settings-names'];
    let servicesTypes = global.$config['services-types'];

    // not valid lang
    for (let lang of langs) {
      if (!langsMap.has('1', lang)) {
        $utils['errors'].serverMessage($t('Not valid lang'));
      }
    }

    // Get langs for service
    let settingLangDefault = await $dbMain['settings'].getSettingBySettingNameAndServiceType({
      settingName: settingsNames.langDefault,
      serviceType,
    });

    if (!settingLangDefault) {
      $utils['errors'].serverMessage($t('Not valid setting'));
    }

    // Check in list langs
    let isExistLang = langs.includes(settingLangDefault.settingValue);
    if (!isExistLang) {
      $utils['errors'].validationMessage({
        path: `${servicesTypes[serviceType].serviceName}--${settingsNames.langs}`,
        message: $t('The list should include the default language'),
      });
    }

    let reusult = await $dbMain['settings'].editSetting({
      settingName,
      serviceType,
      settingValue: langs,
    });

    if (!reusult) {
      $utils['errors'].serverMessage();
    }

    let serviceName = servicesTypes[serviceType].serviceName;
    return $translations.setLangs({ serviceName, langs });
  }

  // Get settings
  async getSettings() {
    let servicesTypes = global.$config['services-types'];
    let settings = await $dbMain['settings'].getSettings();

    let result = {};

    for (let { settingName, serviceType, settingValue } of settings) {
      let serviceName = servicesTypes[serviceType].serviceName;
      if (!result[settingName]) {
        result[settingName] = {};
      }

      result[settingName][serviceName] = settingValue;
    }

    let langsIso = langsMap.all().map((el) => {
      return {
        name: el.name,
        code: el['1'],
      };
    });

    Object.assign(result, {
      imageAppLogo: $utils['paths'].fileProxyPathAppLogo(),
      imageAppPreloder: $utils['paths'].fileProxyPathAppPreloader(),
      imageAppFavicon: $utils['paths'].fileProxyPathAppFavicon(),
    });

    return {
      settings: result,
      langsIso,
    };
  }
}

module.exports = Settings;
