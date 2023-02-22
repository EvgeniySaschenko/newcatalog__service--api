let { $config } = require(global.ROOT_PATH + '/plugins/config');
let path = require('path');
let { v4: uuidv4 } = require('uuid');

const host = `https://${process.env.ADMIN__DOMAIN}`;
const isDev = process.env.NODE_ENV === 'development';
const dataFilesPath = `${global.ROOT_PATH}/data`;
const folderEnv = isDev ? 'dev' : 'prod';
const siteLogoUrlDefault = `${host}/images/site-logo-default.jpg`;
const { screenshotFileExtension, logoFileExtension } = $config['sites'];

let $resourcesPath = {
  // Public resources
  dataFilesPublicPath: `data/${folderEnv}`,
  // URL screenshot
  fileUrlScreenshot: ({ siteScreenshotId }) => {
    return siteScreenshotId
      ? `${host}/images/screenshots/${siteScreenshotId}.${screenshotFileExtension}`
      : null;
  },
  // Path screenshot
  filePathScreenshot: ({ siteScreenshotId }) => {
    return `${dataFilesPath}/${folderEnv}/images/screenshots/${siteScreenshotId}.${screenshotFileExtension}`;
  },
  // URL site logo
  fileUrlSiteLogo: ({ siteLogoId }) => {
    return siteLogoId
      ? `${host}/images/sites-logos/${siteLogoId}.${logoFileExtension}`
      : siteLogoUrlDefault;
  },
  // Path site logo
  filePathSiteLogo: ({ siteLogoId }) => {
    return `${dataFilesPath}/${folderEnv}/images/sites-logos/${siteLogoId}.${logoFileExtension}`;
  },
  // Files whois Site info
  filePathWhoisSiteInfo({ type, siteId }) {
    return `${dataFilesPath}/whois/${type}/${siteId}.json`;
  },
  // File Alexa Rank sites list
  filePathAlexaRank() {
    return `${dataFilesPath}/alexa-rank.csv`;
  },
  // Path temporary file
  filePathTmp(fileName) {
    return `${dataFilesPath}/tmp/${fileName}`;
  },
  // Path save temporary file
  saveTmpFile(fileName) {
    return this.filePathTmp(`${uuidv4()}${path.extname(fileName) || ''}`);
  },
};

module.exports = {
  $resourcesPath,
};
