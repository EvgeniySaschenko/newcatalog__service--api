let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $t, $translations } = require(global.ROOT_PATH + '/plugins/translations');
let langsMap = require('langs');

class Settings {
  // Init settings default
  async initSettingsDefault() {
    for await (let [name, value] of Object.entries($config['settings'])) {
      let result = await this.createSetting({ name, value });
      /*
        Save language settings in "$translations"
        The "type" match is checked by the "set..." function
      */
      $translations.setLangDefault({ type: result.name, lang: result.value });
      $translations.setLans({ type: result.name, langs: result.value });
    }
  }

  // Create setting
  async createSetting({ name, value }) {
    let setting = await $dbMain['settings'].getSettingByName({ name });
    if (!setting) {
      setting = await $dbMain['settings'].createSetting({ name, value });
    }

    return setting;
  }

  // Edit lang default
  async editLangDefault({ name, lang }) {
    // not valid lang
    if (!langsMap.has('1', lang)) {
      throw { server: $t('Server error') };
    }

    // check in list langs
    switch (name) {
      case 'site-lang-default': {
        let langs = await $dbMain['settings'].getSettingByName({ name: 'site-langs' });
        let isExistLang = langs.value.includes(lang);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: 'site-lang-default',
                message: $t('First you need to add the language to the general list'),
              },
            ],
          };
        }
        break;
      }
      case 'admin-lang-default': {
        let langs = await $dbMain['settings'].getSettingByName({ name: 'admin-langs' });
        let isExistLang = langs.value.includes(lang);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: 'admin-lang-default',
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

    let result = await $dbMain['settings'].editSettingByName({ name, value: lang });
    $translations.setLangDefault({ type: name, lang });

    if (!result) {
      throw { server: $t('Server error') };
    }
    return true;
  }

  // Edit langs list
  async editLangsList({ name, langs }) {
    // not valid lang
    for (let lang of langs) {
      if (!langsMap.has('1', lang)) {
        throw { server: $t('Server error') };
      }
    }

    // check in list langs
    switch (name) {
      case 'site-langs': {
        let lang = await $dbMain['settings'].getSettingByName({ name: 'site-lang-default' });
        let isExistLang = langs.includes(lang.value);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: 'site-langs',
                message: $t('The list should include the default language'),
              },
            ],
          };
        }
        break;
      }
      case 'admin-langs': {
        let lang = await $dbMain['settings'].getSettingByName({ name: 'admin-lang-default' });
        let isExistLang = langs.includes(lang.value);
        if (!isExistLang) {
          throw {
            errors: [
              {
                path: 'admin-langs',
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

    let result = await $dbMain['settings'].editSettingByName({ name, value: langs });
    $translations.setLans({ type: name, langs });

    if (!result) {
      throw { server: $t('Server error') };
    }

    return true;
  }

  // Get settings
  async getSettings() {
    let result = await $dbMain['settings'].getSettings();
    let settings = {};
    for (let { name, value } of result) {
      settings[name] = value;
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
