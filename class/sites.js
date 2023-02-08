let db = require(global.ROOT_PATH + '/db');
let sharp = require('sharp');
let config = require(global.ROOT_PATH + '/env.config');
let xml2js = require('xml2js');
let whois = require('whois-json');
let axios = require('axios');

class Sites {
  async init({ siteScreenshotId, logoScreenshotParams, color }) {
    if (!color || !logoScreenshotParams.cutHeight || !siteScreenshotId) {
      throw Error('Не хватает данных');
    }

    let { siteId } = await db['sites-screenshots'].getScreenById({ siteScreenshotId });
    await this.createLogo({ siteScreenshotId, logoScreenshotParams });
    await db.sites.updateSite({ siteId, color, siteScreenshotId });
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
    try {
      let results = await whois(host);
      return Object.keys(results).length ? results : {};
    } catch (error) {
      console.warn(error);
      return {};
    }
  }

  // Получить Alexa
  async getAlexa(host) {
    const defaultAlexa = 10000000;
    try {
      let { data } = await axios.get(`http://data.alexa.com/data?code=ua&cli=10&dat=s&url=${host}`);
      let parser = new xml2js.Parser();
      let result = await parser.parseStringPromise(data);
      return {
        json: JSON.stringify(result),
        rank: result.ALEXA.SD[1].REACH[0].$.RANK || defaultAlexa,
      };
    } catch (error) {
      console.warn(error);
      return {
        json: {},
        rank: defaultAlexa,
      };
    }
  }
}

module.exports = Sites;
