let db = require(global.ROOT_PATH + '/db');
let { M_RatingsItems } = require(global.ROOT_PATH + '/models/ratings-items');
let { M_RatingsItemsImg } = require(global.ROOT_PATH + '/models/ratings-items-img');

let fse = require('fs-extra');
let striptags = require('striptags');
let axios = require('axios');
let xml2js = require('xml2js');
let whois = require('whois-json');
let tldts = require('tldts');
let config = require(global.ROOT_PATH + '/env.config');

class RatingsItems {
  // Создать елемент рейтинга
  async createItem({ ratingId, url, name, labelsIds, priority, isHidden }) {
    url = striptags(url);

    // Проверяем существует ли такой url
    await this.checkRatingUrlExist({ ratingId, url });

    let { hostname, subdomain, domain } = tldts.parse(url);
    let isSubdomain = subdomain && subdomain !== 'www';
    let host = isSubdomain ? hostname : domain;
    let ratingsItemsImg = await this.checkImageExist({ host, ratingId, url, isSubdomain });
    let whoisData = await this.getWhois(host);
    let { rank: alexaRank, json: alexaJson } = await this.getAlexa(host);
    let page = await this.getPage(url); // получить заголовок страницы

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

  // Ппроверяем существует ли такой url в рейтинге
  async checkRatingUrlExist({ ratingId, url }) {
    let itemRatingByUrl = await this.getItemRatingByUrl({ ratingId, url });
    if (itemRatingByUrl) {
      throw { errors: [{ path: 'url', message: 'Такой url уже есть в рейтинге' }] };
    }
    return false;
  }

  // Проверяем наличие картинки для "host"
  async checkImageExist({ host, ratingId, url, isSubdomain }) {
    let isCreatedScreen = false;

    let ratingsItemsImg = null;
    ratingsItemsImg = await db['ratings-items-img'].getImgByHost({ host });

    // если картинки нет то создаём запись
    if (!ratingsItemsImg) {
      isCreatedScreen = true;
      ratingsItemsImg = await db['ratings-items-img'].createImg({ host });
    }

    // Добавить url в очередь на создание скрина - если это субдомен скрин автоматически не создаётся, потому что может быть одинаковый логотип с доменом
    if (isCreatedScreen && !isSubdomain) {
      await this.addItemToProcessing({
        ratingId,
        imgId: ratingsItemsImg.id,
        url,
        host,
      });
    }

    return ratingsItemsImg;
  }

  // Редактировать елемент рейтинга
  async editItem({ id, name, url, labelsIds, priority, isHiden, isCreatedScreen }) {
    let page;
    if (!name.ua) {
      page = await this.getPage(url);
    }

    name.ua = striptags(name.ua ? name.ua : page.name);
    name.ru = striptags(name.ru ? name.ru : name.ua);
    let { hostname } = tldts.parse(url);
    // Проверяем находится ли сейчас в обработке елемент (чобы не поставить повторно)
    let screensProcessing = await db['screenshots-sites'].getScreenProcessingByHost({
      host: hostname,
    });

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
        host: hostname,
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

  // Обновить рейтинг id у item
  async updateRatingIdFromItemById({ itemId, ratingIdNew }) {
    await M_RatingsItems.update(
      {
        ratingId: ratingIdNew,
      },
      { where: { id: itemId } }
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

  // Добавить елемент в очередь на создание скрина
  async addItemToProcessing({ ratingId, url, imgId, host }) {
    let itemProcessingByUrl = await db['screenshots-sites'].getScreenProcessingByHost({ host });
    let result;

    if (!itemProcessingByUrl) {
      result = await db['screenshots-sites'].addScreenProcessing({
        ratingId,
        url,
        imgId,
        host,
      });
    }

    return result;
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
    let ratingsList = db.ratings.getRatingsNotHidden();
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
