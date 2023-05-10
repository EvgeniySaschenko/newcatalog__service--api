let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { $regexp } = require(global.ROOT_PATH + '/plugins/regexp');
let { $t, $translations } = require(global.ROOT_PATH + '/plugins/translations');
let crypto = require('crypto');
let sshpk = require('sshpk');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');
let langsMap = require('langs');
let settingsNames = global.$config['settings-names'];
let axios = require('axios');
class Settings {
  // Init settings default
  async initSettingsDefault() {
    let settings = global.$config['settings'];
    let services = global.$config['services'];

    let runCreateSetting = async (servicesSetting, settingName) => {
      for await (let [serviceName, settingValue] of Object.entries(servicesSetting)) {
        let serviceType = services[serviceName].serviceType;
        let result = await this.createSetting({ settingName, serviceType, settingValue });
        switch (settingName) {
          // langs
          case settingsNames.langs: {
            $translations.setLangs({ serviceName, langs: result.settingValue });
            break;
          }
          // langDefault
          case settingsNames.langDefault: {
            $translations.setLangDefault({ serviceName, langDefault: result.settingValue });
            break;
          }
        }
      }
    };

    // Oher settings
    for await (let [settingName, servicesSetting] of Object.entries(settings)) {
      await runCreateSetting(servicesSetting, settingName);
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
    let services = global.$config['services'];
    let serviceType = services[serviceName].serviceType;

    switch (settingName) {
      // lang default
      case settingsNames.langDefault: {
        let langDefault = settingValue;
        await this.editLangDefault({ settingName, serviceType, serviceName, langDefault });
        break;
      }

      // langs
      case settingsNames.langs: {
        let langs = settingValue;
        await this.editLangs({ settingName, serviceType, serviceName, langs });
        break;
      }

      // color
      case settingsNames.colorBodyBackground:
      case settingsNames.colorPrimary:
      case settingsNames.colorPrimaryInverted:
      case settingsNames.colorTextRegular:
      case settingsNames.colorSelectionBackground:
      case settingsNames.colorSelectionText: {
        await this.editColor({ settingName, serviceType, serviceName, settingValue });
        break;
      }

      // backup
      case settingsNames.backup: {
        await this.editBackup({ settingName, serviceType, serviceName, settingValue });
        break;
      }

      // protector
      case settingsNames.protector: {
        await this.editProtector({ settingName, serviceType, serviceName, settingValue });
        break;
      }

      // oher settings
      case settingsNames.pageTitlePrefix:
      case settingsNames.pageTitleSufix:
      case settingsNames.googleTagManagerId:
      case settingsNames.headStyles:
      case settingsNames.headScript:
      case settingsNames.headerHtml:
      case settingsNames.contentTopHtml:
      case settingsNames.footerHtml:
      case settingsNames.contentBottomHtml: {
        await this.editOherText({ settingName, serviceType, settingValue });
        break;
      }

      default: {
        $utils['errors'].serverMessage();
      }
    }

    return true;
  }

  // Upload setting file
  async editSettingFile({ settingName, serviceName, file }) {
    let settingsExtends = global.$config['settings-extends'];
    let services = global.$config['services'];
    let serviceType = services[serviceName].serviceType;
    let isMimeType = false;
    let filePath = '';
    let extension = file.name.split('.').pop();
    let settingValue = '';
    let mimeTypes = settingsExtends[settingName].mimeTypes;

    switch (settingName) {
      case settingsNames.imageAppLogo: {
        isMimeType = mimeTypes.includes(file.mimetype);
        if (isMimeType) {
          filePath = $utils['paths'].filePathAppLogo({ serviceName, extension });
          settingValue = `${$utils['paths'].fileProxyPathAppLogo({
            serviceName,
            extension,
          })}?v=${Date.now()}`;
        }
        break;
      }
      case settingsNames.imageAppPreloader: {
        isMimeType = mimeTypes.includes(file.mimetype);
        if (isMimeType) {
          filePath = $utils['paths'].filePathAppPreloader({ serviceName, extension });
          settingValue = `${$utils['paths'].fileProxyPathAppPreloader({
            serviceName,
            extension,
          })}?v=${Date.now()}`;
        }
        break;
      }
      case settingsNames.imageAppFavicon: {
        isMimeType = mimeTypes.includes(file.mimetype);
        if (isMimeType) {
          filePath = $utils['paths'].filePathAppFavicon({ serviceName });
          settingValue = `${$utils['paths'].fileProxyPathAppFavicon({
            serviceName,
          })}?v=${Date.now()}`;
        }
        break;
      }
    }

    if (!isMimeType) {
      $utils['errors'].validationMessage({
        path: `${serviceName}--${settingName}`,
        message: $t('Incorrect file type'),
      });
    }

    await file.mv(filePath);

    let reusult = await $dbMain['settings'].editSetting({
      settingName,
      serviceType,
      settingValue,
    });

    if (!reusult) {
      $utils['errors'].serverMessage();
    }

    return true;
  }

  // edit color
  async editColor({ settingName, serviceType, serviceName, settingValue }) {
    settingValue = settingValue.toLowerCase();
    if (!$regexp.colorHex.test(settingValue)) {
      $utils['errors'].validationMessage({
        path: `${serviceName}--${settingName}`,
        message: $t('Color value must be in HEX format'),
      });
    }

    let reusult = await $dbMain['settings'].editSetting({
      settingName,
      serviceType,
      settingValue,
    });

    if (!reusult) {
      $utils['errors'].serverMessage();
    }
    return true;
  }

  // edit backup
  async editBackup({ settingName, serviceType, serviceName, settingValue }) {
    let settings = global.$config['settings']['backup'][serviceName];
    // Errors
    let keysReference = Object.keys(settings).sort().join();
    let keysRequest = Object.keys(settingValue).sort().join();

    if (keysReference !== keysRequest) {
      $utils['errors'].serverMessage();
    }

    if (!settingValue.host) {
      $utils['errors'].validationMessage({
        path: `${serviceName}--host`,
        message: $t('This field cannot be empty'),
      });
    }

    if (!Number.isInteger(settingValue.port) || settingValue.port < 0) {
      $utils['errors'].validationMessage({
        path: `${serviceName}--port`,
        message: $t('Not valid setting'),
      });
    }

    if (!Number.isInteger(settingValue.concurrency) || settingValue.concurrency < 1) {
      $utils['errors'].validationMessage({
        path: `${serviceName}--concurrency`,
        message: $t('Not valid setting'),
      });
    }

    // publicKey
    if (!settingValue.publicKey) {
      await this.generateSshKeys(settingValue.publicKeyComment);
      let { publicKey } = await $dbTemporary['api'].getSshKeysPair();
      settingValue.publicKey = publicKey;
    }

    let reusult = await $dbMain['settings'].editSetting({
      settingName,
      serviceType,
      settingValue,
    });

    if (!reusult) {
      $utils['errors'].serverMessage();
    }
    return true;
  }

  // edit server protector
  async editProtector({ settingName, serviceType, serviceName, settingValue }) {
    let settings = global.$config['settings']['protector'][serviceName];

    // Errors
    let keysReference = Object.keys(settings).sort().join();
    let keysRequest = Object.keys(settingValue).sort().join();

    if (keysReference !== keysRequest) {
      $utils['errors'].serverMessage();
    }

    if (settingValue.url) {
      try {
        await axios.get(settingValue.url);
      } catch (error) {
        $utils['errors'].validationMessage({
          path: `${serviceName}--url`,
          message: $t('The server must be available'),
        });
      }

      if (!settingValue.textKey) {
        $utils['errors'].validationMessage({
          path: `${serviceName}--textKey`,
          message: $t('This field cannot be empty'),
        });
      }
    }

    let reusult = await $dbMain['settings'].editSetting({
      settingName,
      serviceType,
      settingValue,
    });

    if (!reusult) {
      $utils['errors'].serverMessage();
    }
  }

  // Edit oher text
  async editOherText({ settingName, serviceType, settingValue }) {
    let reusult = await $dbMain['settings'].editSetting({
      settingName,
      serviceType,
      settingValue,
    });

    if (!reusult) {
      $utils['errors'].serverMessage();
    }
    return true;
  }

  // Edit lang default
  async editLangDefault({ settingName, serviceType, langDefault, serviceName }) {
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
        path: `${serviceName}--${settingsNames.langDefault}`,
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

    return $translations.setLangDefault({ serviceName, langDefault });
  }

  // Edit langs list
  async editLangs({ settingName, serviceType, serviceName, langs }) {
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
        path: `${serviceName}--${settingsNames.langs}`,
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

    return $translations.setLangs({ serviceName, langs });
  }

  // Get settings
  async getSettings() {
    let settingsExtends = global.$config['settings-extends'];
    let settings = await $dbMain['settings'].getSettings();
    let services = Object.values(global.$config['services']);
    let result = {};

    for (let { settingName, serviceType, settingValue } of settings) {
      let { serviceName } = services.find((el) => el.serviceType == serviceType);

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

    return {
      settingsExtends,
      settings: result,
      langsIso,
    };
  }

  // Generate ssh keys
  async generateSshKeys(publicKeyComment) {
    let { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    let publicKeySsh = sshpk.parseKey(publicKey, 'pem');
    publicKeySsh.comment = publicKeyComment;
    publicKeySsh = publicKeySsh.toString('ssh');

    let privateKeySsh = sshpk.parsePrivateKey(privateKey, 'pem').toString('ssh');

    await $dbTemporary['api'].addSshKeysPair(
      JSON.stringify({
        publicKey: publicKeySsh,
        privateKey: privateKeySsh,
        pem: {
          publicKey,
          privateKey,
        },
      })
    );
  }
}

module.exports = Settings;
