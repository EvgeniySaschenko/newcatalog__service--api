global.ROOT_PATH = process.argv[2];
let SitesScreenshots = require(global.ROOT_PATH + '/class/sites-screenshots');
let Sites = require(global.ROOT_PATH + '/class/sites');
let User = require(global.ROOT_PATH + '/class/user');

if (!global.INIT_APP) {
  let init = async () => {
    global.INIT_APP = true;
    // Starts a process for which will create screenshots when adding sites that are not in the database
    let sitesScreenshots = new SitesScreenshots();
    sitesScreenshots.initProccessScreenshotsCreates();
    // Creates an Alexa Rank list in redis
    let sites = new Sites();
    sites.initCreateAlexaRankList();
    // Starts the process to add whois and Alexa Rank to sites
    sites.initProccessSitesInfoUpdate();

    let user = new User();

    await user.createUserDefault();
  };

  init();
}
