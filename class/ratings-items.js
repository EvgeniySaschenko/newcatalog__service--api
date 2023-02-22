let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let fse = require('fs-extra');
let striptags = require('striptags');
let axios = require('axios');
let { $errors } = require(global.ROOT_PATH + '/plugins/errors');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

class RatingsItems {
  // Создать елемент рейтинга
  async createItem({ ratingId, url, name, labelsIds, priority, isHidden }) {
    url = striptags(url);

    await this.checkRatingUrlExist({ ratingId, url });

    let { isSubdomain, hostname, domain } = $utils.urlInfo(url);
    let host = isSubdomain ? hostname : domain;

    let { siteId } = await this.checkSiteExist({ host, url, isSubdomain });
    let page = await this.getPage(url); // получить заголовок страницы

    for (let key in name) {
      name[key] = striptags(name[key] || page.name);
    }

    let result = await $dbMain['ratings-items'].createItem({
      ratingId,
      url,
      siteId,
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
    let itemRatingByUrl = await $dbMain['ratings-items'].getItemRatingByUrl({
      ratingId,
      url: striptags(url),
    });

    if (itemRatingByUrl) {
      throw {
        errors: [{ path: 'url', message: $errors['A label with the same name already exists'] }],
      };
    }
    return false;
  }

  // Проверяем наличие наличие сайта в таблице сайтов
  async checkSiteExist({ host, url, isSubdomain }) {
    let isCreatedScreen = false;

    let site = await $dbMain.sites.getSiteByHost({ host });

    // если сайта нет то создаём запись
    if (!site) {
      isCreatedScreen = true;
      site = await $dbMain.sites.createSite({ host });
    }

    // Добавить url в очередь на создание скрина - если это субдомен скрин автоматически не создаётся, потому что может быть одинаковый логотип с доменом
    if (isCreatedScreen && !isSubdomain) {
      await $dbMain['sites-screenshots'].addSiteToProcessing({
        url,
        siteId: site.siteId,
      });
    }

    return site;
  }

  // Редактировать елемент рейтинга
  async editItem({ ratingItemId, name, url, labelsIds, priority, isHiden }) {
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
    let result = await $dbMain['ratings-items'].editItem({
      ratingItemId,
      name,
      labelsIds,
      priority,
      isHiden,
    });
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

  // Получить все елементы рейтинга
  async getItemsRating({ ratingId, typeSort }) {
    return await $dbMain['ratings-items'].getItemsRating({ ratingId, typeSort });
  }

  // Удалить елемент
  async deleteItem({ ratingItemId }) {
    let result = await $dbMain['ratings-items'].deleteItem({ ratingItemId });
    if (result) return true;
    throw Error($errors['There is no such id']);
  }

  // Создать кеш для прода
  async createCache() {
    let ratingsList = $dbMain.ratings.getRatingsNotHidden();
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
