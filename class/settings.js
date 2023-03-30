let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');
let { $t } = require(global.ROOT_PATH + '/plugins/translate');
let langsMap = require('langs');

class Settings {
  // Create user - Only 1 user is created now
  async createSettingsDefault() {
    for await (let [name, value] of Object.entries($config['settings'])) {
      await this.createSetting({ name, value });
    }
  }

  // Create setting
  async createSetting({ name, value }) {
    let isExist = await $dbMain['settings'].getSettingByName({ name });
    if (isExist) return;

    let result = await $dbMain['settings'].createSetting({ name, value });
    return result;
  }

  // Edit lang default
  async editLangDefault({ name, lang }) {
    // not valid lang
    if (!langsMap.has('1', lang)) {
      throw { server: $errors['Server error'] };
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
        throw { server: $errors['Server error'] };
      }
    }

    let result = await $dbMain['settings'].editSettingByName({ name, value: lang });

    if (!result) {
      throw { server: $errors['Server error'] };
    }
    return true;
  }

  // Edit langs list
  async editLangsList({ name, langs }) {
    // not valid lang
    for (let lang of langs) {
      if (!langsMap.has('1', lang)) {
        throw { server: $errors['Server error'] };
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
        throw { server: $errors['Server error'] };
      }
    }

    let result = await $dbMain['settings'].editSettingByName({ name, value: langs });

    if (!result) {
      throw { server: $errors['Server error'] };
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
