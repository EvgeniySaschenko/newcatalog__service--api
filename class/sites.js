let sharp = require('sharp');
let whois = require('whois-json');
let fse = require('fs-extra');
let util = require('util');
let exec = util.promisify(require('child_process').exec);
let parserWhois = require('parse-whois');
let tldts = require('tldts');
let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');
let { $resourcesPath } = require(global.ROOT_PATH + '/plugins/resources-path');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
class Sites {
  sitesAlexaRankEmpty = [];
  isSitesAlexaRankProcessing = false;

  // Run process logo create
  async runLogoCreate({ siteScreenshotId, logoScreenshotParams, color }) {
    if (!color || !logoScreenshotParams.cutHeight || !siteScreenshotId) {
      throw Error($errors['Not enough data']);
    }

    let { siteId } = await $dbMain['sites-screenshots'].getSiteScreenshotById({
      siteScreenshotId,
    });
    await this.createLogo({ siteScreenshotId, logoScreenshotParams });
    await $dbMain.sites.updateLogoInfo({ siteId, color, siteScreenshotId });
    // Remove site from unprocessed
    await $dbMain['sites-screenshots'].editLogoCreated({
      siteScreenshotId,
    });
    return true;
  }

  // Create file logo
  async createLogo({ siteScreenshotId, logoScreenshotParams }) {
    let { cutHeight, cutWidth, imgHeight, imgWidth, left, top } = logoScreenshotParams;
    const maxHeight = $config['sites'].logoMaxHeight;
    const maxWidth = $config['sites'].logoMaxWidth;
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

    let file = await sharp($resourcesPath.filePathScreenshot({ siteScreenshotId }))
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
        .jpeg({ mozjpeg: true })
        .toFile($resourcesPath.filePathSiteLogo({ siteScreenshotId }));
    } else {
      // Если норм
      await sharp(file)
        .jpeg({ mozjpeg: true })
        .toFile($resourcesPath.filePathSiteLogo({ siteScreenshotId }));
    }
  }

  // Get site whois info
  async getWhois(host) {
    let { domain } = tldts.parse(host);
    let whoisConsole = {};
    let whoisApi = {};

    // whois from API
    try {
      whoisApi = await whois(domain);
    } catch (error) {
      console.error(`whois API ${error}`);
    }

    // whois from package OS
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

  // Write data whois in file
  async createWhoisFile({ whois, siteId, type }) {
    try {
      if (Object.keys(whois).length) {
        await fse.writeJson($resourcesPath.filePathWhoisSiteInfo({ type, siteId }), whois);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Create list Alexa Rank  sites in Redis
  async initCreateAlexaRankList() {
    await $dbTemporary.createDataDaseCasheAlexaRank();
  }

  // Запустить процесс который будет обновлять alexaRank и dateDomainCreate для сайтов у которых alexaRank = 0
  async initProccessSitesInfoUpdate() {
    // let items = await $dbMain.sites.getSitesDateDomainCreateEmpty();
    // for await (let { siteId, host } of items) {
    //   await $dbMain.sites.updateSitesDateDomainCreateEmpty({ siteId });
    // }
    // let items = await $dbMain.sites.getSitesDateDomainCreateEmpty();
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
    //       await $dbMain.sites.updateSitesDateDomainCreateEmpty({ dateDomainCreate, siteId });
    //     }
    //   }
    // }
    setInterval(async () => {
      // Get sites
      if (!this.sitesAlexaRankEmpty.length) {
        this.sitesAlexaRankEmpty = await $dbMain.sites.getSitesAlexaRankEmpty();
      }
      if (!this.isSitesAlexaRankProcessing && this.sitesAlexaRankEmpty.length) {
        this.isSitesAlexaRankProcessing = true;
        let { host, siteId } = this.sitesAlexaRankEmpty[this.sitesAlexaRankEmpty.length - 1];
        let alexaRank = await this.getAlexaRank(host);
        let { whoisConsole, whoisApi } = await this.getWhois(host);
        let dateDomainCreate = this.getDomainDateCreate({ whoisConsole, whoisApi });
        await this.createWhoisFile({ whois: whoisConsole, siteId, type: 'console' });
        await this.createWhoisFile({ whois: whoisApi, siteId, type: 'api' });
        await $dbMain.sites.updateDomainAndAlexaInfo({
          siteId,
          alexaRank,
          dateDomainCreate,
        });
        console.log({ siteId, dateDomainCreate, host });
        this.sitesAlexaRankEmpty.pop();
        this.isSitesAlexaRankProcessing = false;
      }
    }, $config['sites'].timeIntervalProcessSitesInfoUpdate);
  }

  // Get Alexa Rank
  async getAlexaRank(host) {
    let { domain } = tldts.parse(host);
    let alexaRank = await $dbTemporary.getAlexaRank(domain);
    return alexaRank || $config['sites'].defaultAlexaRank;
  }

  // Get domain date create (return "date" or "null")
  getDomainDateCreate({ whoisConsole, whoisApi }) {
    try {
      let dateRaw = whoisConsole['Creation Date'] || whoisApi['created'] || whoisConsole['created'];
      let isNotDate = isNaN(new Date(dateRaw).getFullYear());
      /*
        handling such strings - '2012-04-02 15:49:24+03 2014-04-03 06:15:53+03 2014-04-03 06:15:53+03 2014-04-03 06:15:55+03'
      */
      if (dateRaw && dateRaw.length > 10 && isNotDate) {
        dateRaw = dateRaw.slice(0, 10);
        isNotDate = isNaN(new Date(dateRaw).getFullYear());
      }
      /*
        dateRaw.length < 10 - you need to make sure that the passed string is not shorter than this "2014-10-10"
        !isNaN(dateRaw) - you need to make sure it's not a number, because new Date() will create a date from a number
        isNaN(new Date(dateRaw).getFullYear()) - date does not contain year
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
