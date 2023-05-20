let { Op } = require('sequelize');
let { name: tableName } = require('./models/sites');
let { $dbMainConnect } = require('./models/_db');
let striptags = require('striptags');

module.exports = {
  tableName,
  // Create an entry for a new sat (if such a domain has never existed before)
  async createSite({ host }) {
    let result = await $dbMainConnect.models['sites'].create({ host });
    return result.get({ plain: true });
  },

  // Edit logo information
  async editLogoInfo({ color, siteScreenshotId, dateLogoCreate }) {
    let result = await $dbMainConnect.models['sites'].update(
      {
        siteLogoId: siteScreenshotId,
        color: color ? striptags(color).toLocaleLowerCase() : null,
        dateLogoCreate,
      },
      { where: { siteScreenshotId } }
    );
    return result[0];
  },

  // Edit site colors
  async editSitesColor({ siteScreenshotId, color }) {
    let result = await $dbMainConnect.models['sites'].update(
      {
        color: color ? striptags(color).toLocaleLowerCase() : null,
      },
      { where: { siteLogoId: siteScreenshotId } }
    );
    return result[0];
  },

  // Edit screenshot information
  async editScreenshotInfo({ siteId, siteScreenshotId }) {
    let result = await $dbMainConnect.models['sites'].update(
      {
        siteScreenshotId,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  // Update image information completely
  async editImageInfo({ siteId, color, siteScreenshotId, siteLogoId, dateLogoCreate }) {
    let result = await $dbMainConnect.models['sites'].update(
      {
        color: color ? striptags(color).toLocaleLowerCase() : null,
        siteScreenshotId,
        siteLogoId,
        dateLogoCreate,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  // Remove screenshot id, to take a new screenshot
  async removeScreenshotInfo({ siteId }) {
    let result = await $dbMainConnect.models['sites'].update(
      {
        siteScreenshotId: null,
        dateLogoCreate: null,
        siteLogoId: null,
        color: null,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  // Remove logo id, to take a new logo
  async removeLogoInfo({ siteId }) {
    let result = await $dbMainConnect.models['sites'].update(
      {
        dateLogoCreate: null,
        siteLogoId: null,
        color: null,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  // Get image record by "siteId"
  async getSiteBySiteId({ siteId }) {
    return await $dbMainConnect.models['sites'].findOne({
      attributes: ['siteId', 'siteScreenshotId', 'siteLogoId', 'color', 'dateLogoCreate'],
      where: {
        siteId,
      },
    });
  },

  // Get image record by "host"
  async getSiteByHost({ host }) {
    return await $dbMainConnect.models['sites'].findOne({
      attributes: ['siteId', 'siteScreenshotId', 'siteLogoId', 'color'],
      where: {
        host,
      },
    });
  },

  // Get sites that don't have Alexa Rank (used to add Alexa Rank / domain registration date)
  async getSitesAlexaRankEmpty() {
    return await $dbMainConnect.models['sites'].findAll({
      attributes: ['siteId', 'host'],
      where: {
        alexaRank: {
          [Op.is]: null,
        },
      },
      order: [['dateCreate', 'DESC']],
    });
  },

  // Edit image information
  async editDomainAndAlexaInfo({ siteId, alexaRank, dateDomainCreate }) {
    let result = await $dbMainConnect.models['sites'].update(
      {
        alexaRank,
        dateDomainCreate,
      },
      { where: { siteId } }
    );
    return result[0];
  },

  async getSitesDateDomainCreateEmpty() {
    return await $dbMainConnect.models['sites'].findAll({
      attributes: ['siteId', 'host'],
      where: {
        dateDomainCreate: null,
      },
      order: [['dateCreate', 'DESC']],
    });
  },

  // This function can have any content - it is for tests or some kind of edits in the data meringue
  async test() {},
};
