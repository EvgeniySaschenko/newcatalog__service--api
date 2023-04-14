let SitesScreenshots = require(global.ROOT_PATH + '/class/sites-screenshots');
let Sites = require(global.ROOT_PATH + '/class/sites');
let User = require(global.ROOT_PATH + '/class/user');
let Settings = require(global.ROOT_PATH + '/class/settings');
let Translations = require(global.ROOT_PATH + '/class/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

class AppManage {
  // Init
  async init() {
    // Create token user secret key
    await $utils['users'].createTokenUserSecretKey();
    // Create settings default
    let settings = new Settings();
    await settings.initSettingsDefault();
    // Set translations for service api
    let translations = new Translations();
    await translations.setTranslationsListServiceApi();
    // Starts a process for which will create screenshots when adding sites that are not in the database
    let sitesScreenshots = new SitesScreenshots();
    sitesScreenshots.initProccessScreenshotsCreates();
    // Creates an Alexa Rank list in redis
    let sites = new Sites();
    sites.initCreateAlexaRankList();
    // Starts the process to add whois and Alexa Rank to sites
    sites.initProccessSitesInfoUpdate();
    // Create user default
    let user = new User();
    await user.createUserDefault();
  }
}

module.exports = AppManage;
