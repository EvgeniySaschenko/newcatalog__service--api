let db = require(global.ROOT_PATH + '/db');
let fse = require('fs-extra');
let striptags = require('striptags');
let axios = require('axios');
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
    let site = await this.checkImageExist({ host, ratingId, url, isSubdomain });
    let page = await this.getPage(url); // получить заголовок страницы

    for (let key in name) {
      name[key] = striptags(name[key] || page.name);
    }

    let result = await db['ratings-items'].createItem({
      ratingId,
      url,
      siteId: site.id,
      name,
      host,
      labelsIds,
      priority,
      isHidden,
    });

    return result;
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

    let site = await db.sites.getSiteByHost({ host });

    // если картинки нет то создаём запись
    if (!site) {
      isCreatedScreen = true;
      site = await db.sites.createSite({ host });
    }

    // Добавить url в очередь на создание скрина - если это субдомен скрин автоматически не создаётся, потому что может быть одинаковый логотип с доменом
    if (isCreatedScreen && !isSubdomain) {
      await this.addItemToProcessing({
        ratingId,
        siteId: site.id,
        url,
        host,
      });
    }

    return site;
  }

  // Редактировать елемент рейтинга
  async editItem({ id, name, url, labelsIds, priority, isHiden }) {
    let page;
    let isTextName = false;
    for (let key in name) {
      if (name[key]) {
        isTextName = true;
      }
    }

    if (!isTextName) {
      page = await this.getPage(url);
    }

    for (let key in name) {
      name[key] = striptags(name[key] || page.name);
    }
    let result = await db['ratings-items'].editItem({ id, name, labelsIds, priority, isHiden });
    return result;
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

  // Добавить елемент в очередь на создание скрина
  async addItemToProcessing({ ratingId, url, siteId, host }) {
    let itemProcessingByUrl = await db['sites-screenshots'].getScreenProcessingByHost({ host });
    let result;

    if (!itemProcessingByUrl) {
      result = await db['sites-screenshots'].addScreenProcessing({
        ratingId,
        url,
        siteId,
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
    for (let { ratingId, typeSort } of ratingsList) {
      let ratingsItems = await this.getItemsRating({ ratingId, typeSort });

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

      await fse.writeJson(global.ROOT_PATH + `/cashe/ratings-items/${ratingId}.json`, ratingsItems);
    }
  }
}

module.exports = RatingsItems;
