let db = require(global.ROOT_PATH + '/db');
let sharp = require('sharp');
let config = require(global.ROOT_PATH + '/env.config');
let whois = require('whois-json');
let fse = require('fs-extra');
let util = require('util');
let exec = util.promisify(require('child_process').exec);
let parserWhois = require('parse-whois');
let tldts = require('tldts');

class Sites {
  sitesAlexaRankEmpty = [];
  isSitesAlexaRankProcessing = false;

  async runLogoCreate({ siteScreenshotId, logoScreenshotParams, color }) {
    if (!color || !logoScreenshotParams.cutHeight || !siteScreenshotId) {
      throw Error('Не хватает данных');
    }

    let { siteId } = await db['sites-screenshots'].getScreenById({ siteScreenshotId });
    await this.createLogo({ siteScreenshotId, logoScreenshotParams });
    await db.sites.updateLogoInfo({ siteId, color, siteScreenshotId });
    // Обновить информацию о том что лого создано и убрать из процесса
    await db['sites-screenshots'].editProcessing({
      siteScreenshotId,
      isProcessed: false,
      isCreatedLogo: true,
    });
    return true;
  }

  // Создать логотип
  async createLogo({ siteScreenshotId, logoScreenshotParams }) {
    let { cutHeight, cutWidth, imgHeight, imgWidth, left, top } = logoScreenshotParams;
    const maxHeight = 100;
    const maxWidth = 200;
    let coefH = cutHeight / maxHeight;
    let coefW = cutWidth / maxWidth;
    let newWidth;
    let newHeight;

    if (coefW > 1) {
      newWidth = cutWidth / coefW;
      newHeight = cutHeight / coefW;
      coefH = newHeight / maxHeight;
      if (coefH > 1) {
        newWidth = newWidth / coefH;
        newHeight = newHeight / coefH;
      }
    } else if (coefH > 1) {
      newHeight = cutHeight / coefH;
      newWidth = cutWidth / coefH;
      coefW = newWidth / maxWidth;
      if (coefW > 1) {
        newWidth = newWidth / coefW;
        newHeight = newHeight / coefW;
      }
    }

    let file = await sharp(config.setSiteScreenAssets(siteScreenshotId))
      .resize({
        width: imgWidth,
        height: imgHeight,
      })
      .toBuffer();

    file = await sharp(file).extract({ left, top, width: cutWidth, height: cutHeight }).toBuffer();

    if (newHeight || newHeight) {
      // Если картинка больше чем надо
      await sharp(file)
        .resize({
          width: Math.floor(newWidth),
          height: Math.floor(newHeight),
        })
        .toFile(config.setSiteLogoAssets(siteScreenshotId));
    } else {
      // Если норм
      await sharp(file).toFile(config.setSiteLogoAssets(siteScreenshotId));
    }
  }

  // Получить whois
  async getWhois(host) {
    let { domain } = tldts.parse(host);
    let whoisConsole = {};
    let whoisApi = {};

    // whois из API
    try {
      whoisApi = await whois(domain);
    } catch (error) {
      console.error(`whois API ${error}`);
    }

    // whois из пакета ОС
    try {
      let { error, stdout } = await exec(`whois ${domain}`, { encoding: 'utf8' });
      if (stdout) {
        let whois = parserWhois.parseWhoIsData(stdout.toString());
        if (whois && Object.keys(whois).length) {
          for (let { attribute, value } of whois) {
            whoisConsole[attribute.trim()] = value.trim();
          }
        }
      }
      if (error) throw error;
    } catch (error) {
      console.error(`whois OS ${error}`);
    }
    return { whoisConsole, whoisApi };
  }

  // Записать данные whois в файл
  async createWhoisFile({ whois, siteId, type }) {
    try {
      if (Object.keys(whois).length) {
        await fse.writeJson(config.setWhoisJSONpath({ type, siteId }), whois);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Создать в памяти объект где ключём будет домен сайта, а значением Alexa Rank (Alexa Rank используется для сортировки сайтов)
  initCreateAlexaRankList() {
    global.ALEXA_RANK_LIST = {};
    let fileContent = fse.readFileSync(global.ROOT_PATH + '/data/alexa-rank.csv', 'utf8');
    for (let item of fileContent.split('\n')) {
      let [rank, host] = item.split(',');
      global.ALEXA_RANK_LIST[host] = +rank;
    }
  }

  // Запустить процесс который будет обновлять alexaRank и dateDomainCreate для сайтов у которых alexaRank = 0
  async initProccessSitesInfoUpdate() {
    // let items = await db['sites'].getSitesDateDomainCreateEmpty();
    // for await (let { siteId, host } of items) {
    //   await db['sites'].updateSitesDateDomainCreateEmpty({ siteId });
    // }
    // let items = await db['sites'].getSitesDateDomainCreateEmpty();
    // console.log(items);
    // for await (let { siteId, host } of items) {
    //   let fileApi = fse.existsSync(global.ROOT_PATH + `/data/whois-api/${siteId}.json`);
    //   let fileConsole = fse.existsSync(global.ROOT_PATH + `/data/whois-console/${siteId}.json`);
    //   if (fileConsole) {
    //     // let who = JSON.parse(
    //     //   fse.readFileSync(global.ROOT_PATH + `/data/whois-api/${siteId}.json`, 'utf8')
    //     // );
    //     let who = JSON.parse(
    //       fse.readFileSync(global.ROOT_PATH + `/data/whois-console/${siteId}.json`, 'utf8')
    //     );
    //     let dateDomainCreate = this.getDomainDateCreate({ whoisConsole: who, whoisApi: {} });
    //     console.log({ siteId, dateDomainCreate, host });
    //     if (dateDomainCreate) {
    //       await db['sites'].updateSitesDateDomainCreateEmpty({ dateDomainCreate, siteId });
    //     }
    //   }
    // }
    setInterval(async () => {
      // Полчить сайты для обработки
      if (!this.sitesAlexaRankEmpty.length) {
        this.sitesAlexaRankEmpty = await db['sites'].getSitesAlexaRankEmpty();
      }
      if (!this.isSitesAlexaRankProcessing && this.sitesAlexaRankEmpty.length) {
        this.isSitesAlexaRankProcessing = true;
        let { host, siteId } = this.sitesAlexaRankEmpty[this.sitesAlexaRankEmpty.length - 1];
        let alexaRank = this.getAlexaRank(host);
        let { whoisConsole, whoisApi } = await this.getWhois(host);
        let dateDomainCreate = this.getDomainDateCreate({ whoisConsole, whoisApi });
        await this.createWhoisFile({ whois: whoisConsole, siteId, type: 'whois-console' });
        await this.createWhoisFile({ whois: whoisApi, siteId, type: 'whois-api' });
        await db['sites'].updateDomainAndAlexaInfo({ siteId, alexaRank, dateDomainCreate });
        console.log({ siteId, dateDomainCreate, host });
        this.sitesAlexaRankEmpty.pop();
        this.isSitesAlexaRankProcessing = false;
      }
    }, 2000);
  }

  // Получить Alexa Rank
  getAlexaRank(host) {
    let { domain } = tldts.parse(host);
    return global.ALEXA_RANK_LIST[domain] || 10000000;
  }

  // Получить дату создания домена
  getDomainDateCreate({ whoisConsole, whoisApi }) {
    try {
      let dateRaw = whoisConsole['Creation Date'] || whoisApi['created'] || whoisConsole['created'];
      let isNotDate = isNaN(new Date(dateRaw).getFullYear());
      /*
        обработка таких строк - '2012-04-02 15:49:24+03 2014-04-03 06:15:53+03 2014-04-03 06:15:53+03 2014-04-03 06:15:55+03'
      */
      if (dateRaw && dateRaw.length > 10 && isNotDate) {
        dateRaw = dateRaw.slice(0, 10);
        isNotDate = isNaN(new Date(dateRaw).getFullYear());
      }
      /*
        dateRaw.length < 10 - нужно убедится что передана строка не короче такой "2014-10-10"
        !isNaN(dateRaw) - нужно убедится что это не число, потому что new Date() создаст дату из числа
        isNaN(new Date(dateRaw).getFullYear()) - дата не содержыт год
      */
      if (!dateRaw || dateRaw.length < 10 || !isNaN(dateRaw) || isNotDate) {
        return null;
      }

      let [day, month, year] = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        day: '2-digit',
        month: '2-digit',
      })
        .format(new Date(dateRaw))
        .split('/');

      return new Date(`${day}-${month}-${year}`);
    } catch (error) {
      console.error(error);
    }
    return null;
  }
}

module.exports = Sites;
