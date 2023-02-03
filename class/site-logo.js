let sharp = require("sharp");
let { M_RatingsItemsImg } = require(ROOT_PATH + "/models/ratings-items-img");
let { M_ScreensProcessing } = require(ROOT_PATH + "/models/screens-processing");
let config = require(ROOT_PATH + "/env.config");

class SiteLogo {
  async init({ id, params, color }) {
    if(!color || !params.cutHeight || !id) {
      throw Error("Не хватает данных");
    }

    let { imgId } = await this.getSiteProcessingById(id);
    await this.createLogo({ id, params });
    await this.updateRatingsItemsImg({ id: imgId, color, name: id });
    await this.updateSiteProcessingById(id);
    return true;
  }

  async getSiteProcessingById(id) {
    let result = await M_ScreensProcessing.findOne({
      attributes: ["imgId"],
      where: { id },
    });
    return result;
  }

  // Создать логотип
  async createLogo({ id, params }) {
    const maxHeight = 100;
    const maxWidth = 200;
    let coefH = params.cutHeight / maxHeight;
    let coefW = params.cutWidth / maxWidth;
    let newWidth;
    let newHeight;

    if (coefW > 1) {
      newWidth = params.cutWidth / coefW;
      newHeight = params.cutHeight / coefW;
      coefH = newHeight / maxHeight;
      if (coefH > 1) {
        newWidth = newWidth / coefH;
        newHeight = newHeight / coefH;
      }
    } else if (coefH > 1) {
      newHeight = params.cutHeight / coefH;
      newWidth = params.cutWidth / coefH;
      coefW = newWidth / maxWidth;
      if (coefW > 1) {
        newWidth = newWidth / coefW;
        newHeight = newHeight / coefW;
      }
    }

    let { cutHeight, cutWidth, imgHeight, imgWidth, left, top } = params;

    let file = await sharp(config.setSiteScreenAssets(id))
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
        .toFile(config.setSiteLogoAssets(id));
    } else {
      // Если норм
      await sharp(file).toFile(config.setSiteLogoAssets(id));
    }
  }

  // Обновить информацию о картинке
  async updateRatingsItemsImg({ id, color, name }) {
    let result = await M_RatingsItemsImg.update(
      {
        name,
        color,
      },
      { where: { id } }
    );
    return result[0];
  }
  // Обновить информацию о том что лого создано и убрать из процесса
  async updateSiteProcessingById(id) {
    let result = await M_ScreensProcessing.update(
      {
        isProcessed: false,
        isCreatedLogo: true,
      },
      { where: { id } }
    );
    return result;
  }
}

module.exports = SiteLogo;