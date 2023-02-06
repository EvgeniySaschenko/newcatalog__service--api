let db = require(global.ROOT_PATH + '/db');
let fse = require('fs-extra');
let striptags = require('striptags');
let axios = require('axios');
let xml2js = require('xml2js');
let whois = require('whois-json');
let tldts = require('tldts');

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

    for (let key in name) {
      name[key] = striptags(name[key] || page.name);
    }

    await db['ratings-items'].createItem({
      ratingId,
      url,
      imgId: ratingsItemsImg.id,
      name,
      whois: whoisData,
      alexaJson,
      alexaRank,
      host,
      labelsIds,
      priority,
      isHidden,
    });
  }

  // Ппроверяем существует ли такой url в рейтинге
  async checkRatingUrlExist({ ratingId, url }) {
    let itemRatingByUrl = await db['ratings-items'].getItemRatingByUrl({
      ratingId,
      url: striptags(url),
    });

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
  async editItem({ id, name, url, labelsIds, priority, isHiden }) {
    let page;
    if (!name.ua) {
      page = await this.getPage(url);
    }
    for (let key in name) {
      name[key] = striptags(name[key] || page.name);
    }
    let result = await db['ratings-items'].editItem({ id, name, labelsIds, priority, isHiden });
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
  async getItemsRating({ ratingId, typeSort }) {
    return await db['ratings-items'].getItemsRating({ ratingId, typeSort });
  }

  // Удалить елемент
  async deleteItem({ id }) {
    let result = await db['ratings-items'].deleteItem({ id });
    if (result) return true;
    throw Error('Такого id нет');
  }

  // Создать кеш для прода
  async createCache() {
    let ratingsList = db.ratings.getRatingsNotHidden();
    for (let item of ratingsList) {
      let ratingsItems = await this.getItemsRating({ ratingId: item.id, typeSort: item.typeSort });

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
