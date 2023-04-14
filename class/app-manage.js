let SitesScreenshots = require(global.ROOT_PATH + '/class/sites-screenshots');
let Sites = require(global.ROOT_PATH + '/class/sites');
let Users = require(global.ROOT_PATH + '/class/users');
let UsersAuth = require(global.ROOT_PATH + '/class/users-auth');
let Settings = require(global.ROOT_PATH + '/class/settings');
let Translations = require(global.ROOT_PATH + '/class/translations');

class AppManage {
  // Init
  async init() {
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
    // Create token user secret key + create user default
    let users = new Users();
    let isNewKey = await users.createTokenUserSecretKey();
    if (isNewKey) {
      let usersAuth = new UsersAuth();
      await usersAuth.logOutAllUsers();
    }
    await users.createUserDefault();
  }
}

module.exports = AppManage;
