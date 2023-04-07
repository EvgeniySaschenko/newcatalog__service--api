let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $t, $translations } = require(global.ROOT_PATH + '/plugins/translations');
let langsMap = require('langs');

class Settings {
  // Init settings default
  async initSettingsDefault() {
    for await (let [type, value] of Object.entries($config['settings'])) {
      let result = await this.createSetting({ type, value });
      // Lang
      if (
        result.type === $config['settings-enum'].siteLang ||
        result.type === $config['settings-enum'].adminLang
      ) {
        $translations.setLangDefault({ type: result.type, lang: result.value });
      }
      // Langs
      if (
        result.type === $config['settings-enum'].siteLangs ||
        result.type === $config['settings-enum'].adminLangs
      ) {
        $translations.setLans({ type: result.type, langs: result.value });
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

    // check in list langs
    switch (type) {
      case $config['settings-enum'].siteLang: {
        let langs = await $dbMain['settings'].getSettingByType({
          type: $config['settings-enum'].siteLangs,
        });
        let isExistLang = langs.value.includes(lang);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: $config['settings-enum'].siteLang,
                message: $t('First you need to add the language to the general list'),
              },
            ],
          };
        }
        break;
      }
      case $config['settings-enum'].adminLang: {
        let langs = await $dbMain['settings'].getSettingByType({
          type: $config['settings-enum'].adminLangs,
        });
        let isExistLang = langs.value.includes(lang);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: $config['settings-enum'].adminLang,
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
    $translations.setLangDefault({ type, lang });

    if (!result) {
      throw { server: $t('Server error') };
    }
    return true;
  }

  // Edit langs list
  async editLangsList({ type, langs }) {
    // not valid lang
    for (let lang of langs) {
      if (!langsMap.has('1', lang)) {
        throw { server: $t('Server error') };
      }
    }

    // check in list langs
    switch (type) {
      case $config['settings-enum'].siteLangs: {
        let lang = await $dbMain['settings'].getSettingByType({
          type: $config['settings-enum'].siteLang,
        });
        let isExistLang = langs.includes(lang.value);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: $config['settings-enum'].siteLangs,
                message: $t('The list should include the default language'),
              },
            ],
          };
        }
        break;
      }
      case $config['settings-enum'].adminLangs: {
        let lang = await $dbMain['settings'].getSettingByType({
          type: $config['settings-enum'].adminLang,
        });
        let isExistLang = langs.includes(lang.value);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: $config['settings-enum'].adminLangs,
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
    $translations.setLans({ type, langs });

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
