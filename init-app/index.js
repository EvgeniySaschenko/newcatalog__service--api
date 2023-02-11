global.ROOT_PATH = process.argv[2];
let SitesScreenshots = require(global.ROOT_PATH + '/class/sites-screenshots');
let Sites = require(global.ROOT_PATH + '/class/sites');

if (!global.INIT_APP) {
  global.INIT_APP = true;
  // Запускает процесс для который будет создавать скриншоты при добавлении сайтов которых нет в базе
  let sitesScreenshots = new SitesScreenshots();
  sitesScreenshots.initProccessScreenshotsCreates();
  // Создаёт в памяти объект со списоком Alexa Rank
  let sites = new Sites();
  sites.initCreateAlexaRankList();
  // Запускает процесс для добавления сайтам whois и Alexa Rank
  sites.initProccessSitesInfoUpdate();
}
