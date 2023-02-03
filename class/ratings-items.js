let { M_RatingsItems } = require(global.ROOT_PATH + '/models/ratings-items');
let { M_RatingsItemsImg } = require(global.ROOT_PATH + '/models/ratings-items-img');
let { M_ScreensProcessing } = require(global.ROOT_PATH + '/models/screens-processing');
let Ratings = require(global.ROOT_PATH + '/class/ratings.js');

let fse = require('fs-extra');
let striptags = require('striptags');
let axios = require('axios');
let xml2js = require('xml2js');
let whois = require('whois-json');
let config = require(global.ROOT_PATH + '/env.config');

class RatingsItems {
  // Создать елемент рейтинга
  async createItem({ ratingId, url, name, labelsIds, priority, isHidden }) {
    url = striptags(url);
    let itemRatingByUrl = await this.getItemRatingByUrl({ ratingId, url });

    if (itemRatingByUrl) {
      throw { errors: [{ path: 'url', message: 'Такой url уже есть в рейтинге' }] };
    }
    let { host } = this.parseUrl(url);

    let whoisData = await this.getWhois(host);

    let isCreatedScreen = false;
    // Проверяем наличие id картинки для домена
    let ratingsItemsImg = await this.getRatingsItemsImgByHost({ host });
    // Если id нет, то создаём
    if (!ratingsItemsImg) {
      isCreatedScreen = true;
      ratingsItemsImg = await this.createRatingsItemsImg({ host });
    }
    // Добавить в обработку - если отсутсвует изображение
    if (isCreatedScreen) {
      await this.addItemToProcessing({
        ratingId,
        imgId: ratingsItemsImg.id,
        url,
        host,
      });
    }

    let { rank: alexaRank, json: alexaJson } = await this.getAlexa(host);
    let page = await this.getPage(url);

    name.ua = striptags(name.ua ? name.ua : page.name);
    name.ru = striptags(name.ru ? name.ru : name.ua);

    let result = await M_RatingsItems.create({
      ratingId,
      url,
      imgId: ratingsItemsImg.id,
      name,
      whois: whoisData,
      alexaJson,
      alexaRank,
      pageHtml: page.pageHtml,
      host,
      labelsIds,
      priority,
      isHidden,
    });
    result = result.get({ plain: true });

    return result;
  }

  // Редактировать елемент рейтинга
  async editItem({ id, name, url, labelsIds, priority, isHiden, isCreatedScreen }) {
    let page;
    if (!name.ua) {
      page = await this.getPage(url);
    }

    name.ua = striptags(name.ua ? name.ua : page.name);
    name.ru = striptags(name.ru ? name.ru : name.ua);
    let { host } = this.parseUrl(url);

    // Проверяем находится ли сейчас в обработке елемент (чобы не поставить повторно)
    let screensProcessing = await this.checkScreensProcessingByHost({ host });

    let result = await M_RatingsItems.update(
      {
        name,
        labelsIds,
        priority,
        isHiden,
      },
      { where: { id } }
    );

    if (isCreatedScreen && !screensProcessing) {
      let itemRating = await this.getItemRatingById({ id });

      await this.addItemToProcessing({
        ratingId: itemRating.ratingId,
        imgId: itemRating.imgId,
        url,
        host,
      });
    }

    return result;
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
  // Обновить Whois
  /*
  async updateWhoisAll() {
    let sites = await M_RatingsItems.findAll({
      attributes: ["id", "url", "whois"],
    });

    for (let item of sites) {
      try {
        if (!item.whois || !Object.keys(item.whois).length) {
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve();
              console.log("setTimeout");
            }, 2000);
          });

          let { host } = this.parseUrl(item.url);
          let whoisData = await this.getWhois(host);
          await M_RatingsItems.update(
            {
              whois: whoisData,
            },
            { where: { id: item.id } }
          );

          console.log("Успех", host, item.id);
        }
      } catch (error) {
        console.log("Error", item.url, item.id);
      }
    }
  }
  */

  // Обновить рейтинг id у items
  async updateRatingIdFromItems({ ratingIdOld, ratingIdNew }) {
    await M_RatingsItems.update(
      {
        ratingId: ratingIdNew,
      },
      { where: { ratingId: ratingIdOld } }
    );
  }

  // Обновить рейтинг id у screens-processing
  async updateRatingIdFromScreensProcessings({ ratingIdOld, ratingIdNew }) {
    await M_ScreensProcessing.update(
      {
        ratingId: ratingIdNew,
      },
      { where: { ratingId: ratingIdOld } }
    );
  }

  // Обновить рейтинг id у item
  async updateRatingIdFromItemById({ itemId, ratingIdNew }) {
    await M_RatingsItems.update(
      {
        ratingId: ratingIdNew,
      },
      { where: { id: itemId } }
    );
  }

  // Обновить рейтинг id у screens-processing
  async updateRatingIdFromScreenProcessingByImgIdAndItemId({ ratingIdOld, ratingIdNew, imgId }) {
    await M_ScreensProcessing.update(
      {
        ratingId: ratingIdNew,
      },
      { where: { ratingId: ratingIdOld, imgId } }
    );
  }

  // Получить страницу
  async getPage(url) {
    try {
      let result = await axios.get(url);
      return this.parsePageHTML(result.data);
    } catch (error) {
      console.warn(error);
      return {
        name: '',
        pageHtml: '',
      };
    }
  }

  // Парсинг HTML
  parsePageHTML(html) {
    let titleResult = /<title[^>]*>(.*?)<\/title>/gi.exec(html.replace(/\r?\n/g, ''));
    return {
      name: titleResult ? striptags(titleResult[0]).slice(0, 254) : '',
      html,
    };
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

  // Добавить елемент в обработку
  async addItemToProcessing({ ratingId, url, imgId, host }) {
    let itemProcessingByUrl = await this.getItemProcessingByHost({ host });
    let result;

    if (!itemProcessingByUrl) {
      result = await M_ScreensProcessing.create({
        ratingId,
        url,
        imgId,
        host,
      });
      return result.get({ plain: true });
    }

    return result;
  }

  // Получить елемент в который находится в обработке (проверка)
  async getItemProcessingByHost({ host }) {
    let result = await M_ScreensProcessing.findOne({
      attributes: ['id'],
      where: {
        host,
        isProcessed: true,
      },
    });

    return result;
  }

  // Получить домен из URL
  parseUrl(url) {
    try {
      let { host } = new URL(url);
      return { host };
    } catch (error) {
      console.warn(error);
      return { host: '' };
    }
  }

  // Получить все елементы рейтинга
  async getItems({ ratingId, typeSort }) {
    let order = {
      alexa: [
        ['priority', 'DESC'],
        ['alexaRank', 'ASC'],
        ['click', 'DESC'],
        ['id', 'ASC'],
      ],
      click: [
        ['priority', 'DESC'],
        ['click', 'DESC'],
        ['alexaRank', 'ASC'],
        ['id', 'ASC'],
      ],
    };

    let result = await M_RatingsItems.findAll({
      attributes: [
        'id',
        'ratingId',
        'name',
        'url',
        'whois',
        'labelsIds',
        'priority',
        'click',
        'isHiden',
        'alexaRank',
      ],
      where: {
        ratingId: +ratingId,
      },
      order: order[typeSort],
      include: [
        {
          model: M_RatingsItemsImg,
          attributes: ['id', 'color', 'name'],
          as: 'img',
        },
      ],
      raw: true,
      nest: true,
    });

    result = result.map((el) => {
      el.img.url = config.setSiteLogoUrl(el.img.name);
      return el;
    });
    return result;
  }

  // Получить сайт по url и ratingId (для проверки на уникальность)
  async getItemRatingByUrl({ ratingId, url }) {
    let result = await M_RatingsItems.findOne({
      attributes: ['id'],
      where: {
        ratingId,
        url: striptags(url),
      },
    });
    return result;
  }

  // Создать запись для новой картинки (если такого домена никогда еще небыло)
  async createRatingsItemsImg({ host }) {
    let result = await M_RatingsItemsImg.create({ host });
    return result.get({ plain: true });
  }

  // Получить запись о картинке
  async getRatingsItemsImgByHost({ host }) {
    let parts = host.split('.');
    let result;
    // Нужен потомучто элементы удаляются из массива
    let partsCopy = [...parts];

    for (let item of parts) {
      result = await M_RatingsItemsImg.findOne({
        attributes: ['id'],
        where: {
          host: partsCopy.join('.'),
        },
      });
      partsCopy.shift();
      if (result) break;
    }
    return result;
  }

  // Проверка на наличие картинки в обработке
  async checkScreensProcessingByHost({ host }) {
    let result = await M_ScreensProcessing.findOne({
      attributes: ['imgId'],
      where: {
        host,
        isProcessed: true,
      },
    });
    return result;
  }

  // Получить елемент по id
  async getItemRatingById({ id }) {
    let result = await M_RatingsItems.findOne({
      attributes: [
        'id',
        'ratingId',
        'name',
        'url',
        'imgId',
        'labelsIds',
        'priority',
        'whois',
        'alexaRank',
        'click',
        'isHiden',
      ],
      where: {
        id,
      },
    });
    return result;
  }

  // Удалить елемент
  async deleteItem({ id }) {
    let result = await M_RatingsItems.destroy({ where: { id } });
    if (result) return true;
    throw Error('Такого id нет');
  }

  // Обновить все ярлыки у елементов
  async editLabelsItems({ labelsItems }) {
    let result;
    for (let key in labelsItems) {
      result = await M_RatingsItems.update(
        {
          labelsIds: labelsItems[key],
        },
        { where: { id: key } }
      );
    }
    return result;
  }

  // Создать кеш для прода
  async createCache() {
    let ratings = new Ratings();
    let ratingsList = await ratings.getRatingsNotHidden();
    for (let item of ratingsList) {
      let ratingsItems = await this.getItems({ ratingId: item.id, typeSort: item.typeSort });

      ratingsItems = ratingsItems.map((el) => {
        (
          el.whois.creationDate ||
          el.whois.created ||
          (el.whois.createdOn || '').slice(7, 11) ||
          ''
        ).slice(0, 4);
        delete el.whois;
        return el;
      });

      await fse.writeJson(global.ROOT_PATH + `/cashe/ratings-items/${item.id}.json`, ratingsItems);
    }
  }
}

module.exports = RatingsItems;
