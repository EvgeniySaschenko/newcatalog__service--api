let SitesScreenshots = require(global.ROOT_PATH + '/class/sites-screenshots');
let Sites = require(global.ROOT_PATH + '/class/sites');
let Cache = require(global.ROOT_PATH + '/class/cache');
let Users = require(global.ROOT_PATH + '/class/users');
let UsersAuth = require(global.ROOT_PATH + '/class/users-auth');
let Settings = require(global.ROOT_PATH + '/class/settings');
let Translations = require(global.ROOT_PATH + '/class/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let axios = require('axios');
let { IS_DEMO_MODE } = process.env;

class AppMain {
  // Init
  async init() {
    $utils['service'].blockService();
    // Create settings default
    let settings = new Settings();
    await settings.initSettingsDefault();
    // Set translations for service api
    let translations = new Translations();
    await translations.setTranslationsListServiceApi();
    // Add settings to cache on first server start
    let cache = new Cache();
    await cache.initCacheSettings();
    // Starts a process for which will create screenshots when adding sites that are not in the database
    let sitesScreenshots = new SitesScreenshots();
    await sitesScreenshots.initProccessScreenshotsCreates();
    // Creates an Alexa Rank list in redis
    let sites = new Sites();
    await sites.initCreateAlexaRankList();
    // Starts the process to add whois and Alexa Rank to sites
    await sites.initProccessSitesInfoUpdate();
    // Create token user secret key + create user default
    let users = new Users();
    let isNewKey = await users.createTokenUserSecretKey();
    if (isNewKey) {
      let usersAuth = new UsersAuth();
      await usersAuth.logOutAllUsers();
    }
    await users.createUserDefault();

    // Demo mode
    if (IS_DEMO_MODE) {
      await users.createUserDemo();
    } else {
      await users.deleteUserDemo();
    }

    // If before that there was a launch in demo mode
    $utils['service'].unblockService();
  }

  // Blocking access to the API using a third-party server
  async checkProtection() {
    let settingsNames = global.$config['settings-names'];
    let services = global.$config['services'];
    let setting = await $dbMain['settings'].getSettingBySettingNameAndServiceType({
      settingName: settingsNames.protector,
      serviceType: services.api.serviceType,
    });

    let { url, textKey } = setting.settingValue;
    if (url) {
      try {
        let response = await axios.get(url);
        if (String(response.data) !== String(textKey)) {
          return false;
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    return true;
  }
}

module.exports = AppMain;
