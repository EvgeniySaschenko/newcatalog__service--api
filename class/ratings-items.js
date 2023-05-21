let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let striptags = require('striptags');
let axios = require('axios');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

class RatingsItems {
  // Create rating item
  async createItem({ ratingId, url, name, labelsIds, priority, isHidden }) {
    url = striptags(url);

    await this.checkRatingUrlExist({ ratingId, url });

    let { isSubdomain, hostname, domain } = $utils['common'].urlInfo(url);

    let { siteId } = await this.checkSiteExist({ hostname, url, isSubdomain, domain });
    let page = await this.getPage(url); // get page title

    for (let key in name) {
      name[key] = striptags(name[key] || page.name);
    }

    let { ratingItemId } = await $dbMain['ratings-items'].createItem({
      ratingId,
      url,
      siteId,
      name,
      host: hostname,
      labelsIds,
      priority,
      isHidden,
    });

    return { ratingItemId };
  }

  // Check if such url exists in the ranking
  async checkRatingUrlExist({ ratingId, url }) {
    let itemRatingByUrl = await $dbMain['ratings-items'].getItemRatingByUrl({
      ratingId,
      url: striptags(url),
    });

    if (itemRatingByUrl) {
      $utils['errors'].validationMessage({
        path: 'url',
        message: $t('A label with the same name already exists'),
      });
    }
    return false;
  }

  /*
    Adds a site if it is not in the site table + puts it in the queue for taking a screenshot
    Subdomains are not queued
  */
  async checkSiteExist({ hostname, url, isSubdomain, domain }) {
    let { siteId, isCreateSite } = await this.createSite({ hostname });

    // For domains
    if (!isSubdomain && isCreateSite) {
      await $dbMain['sites-screenshots'].addSiteToProcessing({
        url,
        siteId,
      });
    }

    // If it is a "subdomain" create an entry for the "domain" - if the entry does not exist
    if (isSubdomain) {
      let { siteId, isCreateSite } = await this.createSite({ hostname: domain });

      // We check the availability of the domain via https or http - if we managed to get the page, we take a screenshot
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

  // Create a site in the site table if there is none, or return an existing one
  async createSite({ hostname }) {
    let isCreateSite = false;
    let site = await $dbMain['sites'].getSiteByHost({ host: hostname });
    if (!site) {
      isCreateSite = true;
      site = await $dbMain['sites'].createSite({ host: hostname });
    }

    return { siteId: site.siteId, isCreateSite };
  }

  // Edit Rating Item
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
      name[key] = striptags(name[key] || page?.name || '');
    }
    let result = await $dbMain['ratings-items'].editItem({
      ratingItemId,
      name,
      labelsIds,
      priority,
      isHiden,
    });

    if (!result) $utils['errors'].serverMessage();
    return true;
  }

  // Get Page
  async getPage(url) {
    try {
      let result = await axios.get(url);
      return this.parsePageHTML(result.data);
    } catch (error) {
      console.error(error);
      return {
        name: '',
        html: '',
      };
    }
  }

  // Parse Page HTML (search title)
  parsePageHTML(html) {
    let titleResult = /<title[^>]*>(.*?)<\/title>/gi.exec(html.replace(/\r?\n/g, ''));
    return {
      name: titleResult ? striptags(titleResult[0]).slice(0, 254) : '',
      html,
    };
  }

  // Get all rating items
  async getItemsRating({ ratingId, typeSort }) {
    return await $dbMain['ratings-items'].getItemsRating({ ratingId, typeSort });
  }

  // Delete item
  async deleteItem({ ratingItemId }) {
    let tableRecord = await $dbMain['ratings-items'].getItemByRatingItemId({ ratingItemId });
    await $dbMain['records-deleted'].createRecords({
      tableName: $dbMain['ratings-items'].tableName,
      tableId: ratingItemId,
      tableRecord,
    });

    let result = await $dbMain['ratings-items'].deleteItem({ ratingItemId });
    if (!result) $utils['errors'].serverMessage();
    return true;
  }
}

module.exports = RatingsItems;
