let sharp = require('sharp');
let whois = require('whois-json');
let fse = require('fs-extra');
// let util = require('util');
// let exec = util.promisify(require('child_process').exec);
// let parserWhois = require('parse-whois');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let idIntervalProccessSites = null;

class Sites {
  // Get site by id
  async getSiteBySiteId({ siteId }) {
    let result = await $dbMain['sites'].getSiteBySiteId({ siteId });
    return result;
  }

  // Run process logo create
  async runLogoCreate({ siteScreenshotId, logoScreenshotParams, color }) {
    if (!color || !logoScreenshotParams.cutHeight || !siteScreenshotId) {
      $utils['errors'].serverMessage($t('Not enough data'));
    }

    let screenshot = await $dbMain['sites-screenshots'].getSiteScreenshotById({
      siteScreenshotId,
    });

    if (!screenshot || !screenshot.dateScreenshotCreated) {
      $utils['errors'].serverMessage();
    }

    await this.createLogo({ siteScreenshotId, logoScreenshotParams });
    let result = await $dbMain['sites'].editLogoInfo({
      color,
      siteScreenshotId,
      dateLogoCreate: new Date(),
    });
    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Run process logo recreate
  async runRecreateLogo({ siteId }) {
    let result = await $dbMain['sites'].removeLogoInfo({ siteId });
    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Update sites color
  async editSitesColor({ siteScreenshotId, color }) {
    let result = await $dbMain['sites'].editSitesColor({ siteScreenshotId, color });
    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Create file logo
  async createLogo({ siteScreenshotId, logoScreenshotParams }) {
    let { cutHeight, cutWidth, imgHeight, imgWidth, left, top } = logoScreenshotParams;
    const maxHeight = global.$config['sites'].logoMaxHeight;
    const maxWidth = global.$config['sites'].logoMaxWidth;

    // Make screenshot the same size as frontend (ZOOM)
    let file = await sharp($utils['paths'].filePathScreenshot({ siteScreenshotId }))
      .resize({
        width: imgWidth,
        height: imgHeight,
      })
      .toBuffer();

    // Cut logo from screenshot
    file = await sharp(file).extract({ left, top, width: cutWidth, height: cutHeight }).toBuffer();

    // Calculate maximum logo dimensions
    let logo = $utils['common'].сalcmMaxDimensionsImage({
      height: cutHeight,
      width: cutWidth,
      maxHeight,
      maxWidth,
    });

    // Save logo
    await sharp(file)
      .resize({
        width: Math.floor(logo.width),
        height: Math.floor(logo.height),
      })
      .jpeg({ mozjpeg: true })
      .toFile($utils['paths'].filePathSiteLogo({ siteLogoId: siteScreenshotId }));
  }

  // Get site whois info
  async getWhois(domain) {
    let whoisConsole = {};
    let whoisApi = {};

    // whois from API
    try {
      let pathFile = $utils['paths'].filePathWhoisSiteInfo({ type: 'api', domain });
      let isExistFile = await fse.pathExists(pathFile);
      if (isExistFile) {
        whoisApi = await fse.readJson(pathFile);
      } else {
        whoisApi = await whois(domain);
        await this.createWhoisFile({ whois: whoisApi, domain, path: pathFile });
      }
    } catch (error) {
      console.error(`whois API ${error}`);
    }

    // whois from package OS
    // try {
    //   let pathFile = $utils['paths'].filePathWhoisSiteInfo({ type: 'console', domain });
    //   let isExistFile = await fse.pathExists(pathFile);
    //   if (isExistFile) {
    //     whoisConsole = await fse.readJson(pathFile);
    //   } else {
    //     let { error, stderr, stdout } = await exec(`whois ${domain}`, { encoding: 'utf8' });
    //     if (stdout) {
    //       let whois = parserWhois.parseWhoIsData(stdout.toString());
    //       if (whois && Object.keys(whois).length) {
    //         for (let { attribute, value } of whois) {
    //           whoisConsole[attribute.trim()] = value.trim();
    //         }
    //       }
    //     }
    //     if (stderr) throw stderr;
    //     if (error) throw error;
    //     await this.createWhoisFile({ whois: whoisConsole, domain, path: pathFile });
    //   }
    // } catch (error) {
    //   console.error(`whois OS ${error}`);
    // }
    return { whoisConsole, whoisApi };
  }

  // Write data whois in file
  async createWhoisFile({ whois, domain, path }) {
    try {
      if (Object.keys(whois).length) {
        whois.hostNameCustom = domain;
        await fse.writeJson(path, whois);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Create list Alexa Rank  sites in Redis
  async initCreateAlexaRankList() {
    await $dbTemporary['alexa'].createDataDaseCacheAlexaRank();
  }

  // Check for images for the site
  async checkImagesForSite({ host }) {
    let result = await $dbMain['sites'].getSiteByHost({
      host,
    });

    // If images from site not exist
    if (!result) {
      return { isNotExistImages: true };
    }

    let { siteId, siteScreenshotId, siteLogoId, color } = result;

    // If screenshot from site is processed
    if (!siteScreenshotId) {
      let result = await $dbMain['sites-screenshots'].checkSiteProcessingBySiteId({
        siteId,
      });
      if (!result) return { isNotExistImages: true };
      return {
        isScreenshotProcessCreate: true,
      };
    }

    let logoImg = siteLogoId ? $utils['paths'].fileProxyPathSiteLogo({ siteLogoId }) : null;
    let screenshotImg = $utils['paths'].fileProxyPathScreenshot({ siteScreenshotId });

    // If exist logo or screenshot
    return {
      siteId,
      logoImg,
      color,
      screenshotImg,
    };
  }

  // Link domain images to subdomain
  async linkDomainImagesToSubdomain({ domainSiteId, subdomainSiteId }) {
    let result = await $dbMain['sites'].getSiteBySiteId({ siteId: domainSiteId });

    if (!result) $utils['errors'].serverMessage();

    let { color, siteScreenshotId, siteLogoId, dateLogoCreate } = result;

    let resultImageInfo = await $dbMain['sites'].editImageInfo({
      siteId: subdomainSiteId,
      color,
      siteScreenshotId,
      siteLogoId,
      dateLogoCreate,
    });
    if (!resultImageInfo) $utils['errors'].serverMessage();
    return true;
  }

  // Run a process that will update alexaRank and dateDomainCreate for sites that have alexaRank = 0
  async initProccessSitesInfoUpdate() {
    let sitesAlexaRankEmpty = [];
    let isBlock = false;

    idIntervalProccessSites = setInterval(async () => {
      if (isBlock) return;
      isBlock = true;
      // Get sites
      if (!sitesAlexaRankEmpty.length) {
        sitesAlexaRankEmpty = await $dbMain['sites'].getSitesAlexaRankEmpty();
      }

      if (sitesAlexaRankEmpty.length) {
        let { host, siteId } = sitesAlexaRankEmpty[sitesAlexaRankEmpty.length - 1];
        let alexaRank = await this.getAlexaRank(host);
        let { domain } = $utils['common'].urlInfo(host);
        let { whoisConsole, whoisApi } = await this.getWhois(domain);
        let dateDomainCreate = this.getDomainDateCreate({ whoisConsole, whoisApi });

        await $dbMain['sites'].editDomainAndAlexaInfo({
          siteId,
          alexaRank,
          dateDomainCreate,
        });
        sitesAlexaRankEmpty.pop();
      }
      isBlock = false;
    }, global.$config['sites'].timeIntervalProcessSitesInfoUpdate);
  }

  // Restart proccess sites info update
  restartProccessSitesInfoUpdate() {
    clearInterval(idIntervalProccessSites);
    this.initProccessSitesInfoUpdate();
    return true;
  }

  // Get Alexa Rank
  async getAlexaRank(host) {
    let { domain } = $utils['common'].urlInfo(host);
    let alexaRank = await $dbTemporary['alexa'].getAlexaRank(domain);
    return alexaRank || global.$config['sites'].defaultAlexaRank;
  }

  // Get domain date create (return "date" or "null")
  getDomainDateCreate({ whoisConsole, whoisApi }) {
    try {
      let dateRaw =
        whoisConsole['Creation Date'] ||
        whoisApi['created'] ||
        whoisConsole['created'] ||
        whoisApi['creationDate'];
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
