let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let striptags = require('striptags');
let axios = require('axios');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

class RatingsItems {
  // Создать елемент рейтинга
  async createItem({ ratingId, url, name, labelsIds, priority, isHidden }) {
    url = striptags(url);

    await this.checkRatingUrlExist({ ratingId, url });

    let { isSubdomain, hostname, domain } = $utils['common'].urlInfo(url);

    let { siteId } = await this.checkSiteExist({ hostname, url, isSubdomain, domain });
    let page = await this.getPage(url); // получить заголовок страницы

    for (let key in name) {
      name[key] = striptags(name[key] || page.name);
    }

    let result = await $dbMain['ratings-items'].createItem({
      ratingId,
      url,
      siteId,
      name,
      host: hostname,
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
        errors: [{ path: 'url', message: $t('A label with the same name already exists') }],
      };
    }
    return false;
  }

  /*
    Добавляет сайт если его нет в таблице сайтов + ставит в очередб на создание скриншота
    Субдомены в очередь не довляются
  */
  async checkSiteExist({ hostname, url, isSubdomain, domain }) {
    let { siteId, isCreateSite } = await this.createSite({ hostname });

    // Для доменов
    if (!isSubdomain && isCreateSite) {
      await $dbMain['sites-screenshots'].addSiteToProcessing({
        url,
        siteId,
      });
    }

    // Если это "субдомен" создаём запись для "домена" - если записи не существует
    if (isSubdomain) {
      let { siteId, isCreateSite } = await this.createSite({ hostname: domain });

      // Проверяем доступность добмена по https или http - если удалось получить страницу делаем скриншот
      if (isCreateSite) {
        let url = `https://${domain}`;
        let result = await this.getPage(url);

        if (!result.html) {
          url = `http://${domain}`;
          result = await this.getPage(url);
        }

        if (result.html) {
          await $dbMain['sites-screenshots'].addSiteToProcessing({
            url,
            siteId,
          });
        }
      }
    }

    return { siteId };
  }

  // Создать сайт в таблице сайтов если его нет, или вернуть существующий
  async createSite({ hostname }) {
    let isCreateSite = false;
    let site = await $dbMain['sites'].getSiteByHost({ host: hostname });
    if (!site) {
      isCreateSite = true;
      site = await $dbMain['sites'].createSite({ host: hostname });
    }

    return { siteId: site.siteId, isCreateSite };
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
        html: '',
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
    let tableRecord = await $dbMain['ratings-items'].getItemByRatingItemId({ ratingItemId });
    await $dbMain['records-deleted'].createRecords({
      tableName: $dbMain['ratings-items'].tableName,
      tableId: ratingItemId,
      tableRecord,
    });

    let result = await $dbMain['ratings-items'].deleteItem({ ratingItemId });
    if (result) return true;
    throw Error($t('There is no such id'));
  }
}

module.exports = RatingsItems;
