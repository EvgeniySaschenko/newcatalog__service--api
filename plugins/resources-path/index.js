let { $config } = require(global.ROOT_PATH + '/plugins/config');
const host = `https://${process.env.ADMIN__DOMAIN}`;
const isDev = process.env.NODE_ENV === 'development';
const dataFilesPath = `${global.ROOT_PATH}/data`;
const folderEnv = isDev ? 'dev' : 'prod';
const siteLogoUrlDefault = `${host}/images/site-logo-default.jpg`;
const { screenshotFileExtension, logoFileExtension } = $config['sites'];

let $resourcesPath = {
  // Public resources
  dataFilesPublicPath: `data/${folderEnv}`,
  // Screenshot URL
  fileUrlScreenshot: ({ siteScreenshotId }) => {
    return `${host}/images/screenshots/${siteScreenshotId}.${screenshotFileExtension}`;
  },
  // Screenshot path
  filePathScreenshot: ({ siteScreenshotId }) => {
    return `${dataFilesPath}/${folderEnv}/images/screenshots/${siteScreenshotId}.${screenshotFileExtension}`;
  },
  // Site logo URL
  fileUrlSiteLogo: ({ siteScreenshotId }) => {
    return siteScreenshotId
      ? `${host}/images/sites-logos/${siteScreenshotId}.${logoFileExtension}`
      : siteLogoUrlDefault;
  },
  // Site logo path
  filePathSiteLogo: ({ siteScreenshotId }) => {
    return `${dataFilesPath}/${folderEnv}/images/sites-logos/${siteScreenshotId}.${logoFileExtension}`;
  },
  // Files whois Site info
  filePathWhoisSiteInfo({ type, siteId }) {
    return `${dataFilesPath}/whois/${type}/${siteId}.json`;
  },
  // File Alexa Rank sites list
  filePathAlexaRank() {
    return `${dataFilesPath}/alexa-rank.csv`;
  },
};

module.exports = {
  $resourcesPath,
};
