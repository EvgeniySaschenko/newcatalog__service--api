let path = require('path');
let { v4: uuidv4 } = require('uuid');

const siteLogoUrlDefault = `/images/default-image.png`;
const { screenshotFileExtension, logoFileExtension } = global.$config['sites'];
const { FILES__SERVICE } = process.env;
const basePathFiles = `${global.ROOT_PATH}/symlinks/${FILES__SERVICE}`;

module.exports = {
  // PROXY
  // The path to screenshots of sites through a proxy
  fileProxyPathScreenshot: ({ siteScreenshotId }) => {
    return siteScreenshotId
      ? `/images/site-screenshots/${siteScreenshotId}.${screenshotFileExtension}`
      : null;
  },
  // The path to site logos through a proxy
  fileProxyPathSiteLogo: ({ siteLogoId, resetCache }) => {
    let sufix = resetCache ? `?=${resetCache}` : '';
    return siteLogoId
      ? `/images/site-logos/${siteLogoId}.${logoFileExtension}${sufix}`
      : siteLogoUrlDefault;
  },
  // The path to app logo through a proxy
  fileProxyPathAppLogo: () => {
    return '/images/app/logo.png';
  },
  // The path to app preloader through a proxy
  fileProxyPathAppPreloader: () => {
    return '/images/app/preloader.png';
  },
  // The path to app favicon through a proxy
  fileProxyPathAppFavicon: () => {
    return '/images/app/favicon.ico';
  },
  // SYMLINKS
  // Path screenshot
  filePathScreenshot: ({ siteScreenshotId }) => {
    return `${basePathFiles}/images/site-screenshots/${siteScreenshotId}.${screenshotFileExtension}`;
  },
  // Path site logo
  filePathSiteLogo: ({ siteLogoId }) => {
    return `${basePathFiles}/images/site-logos/${siteLogoId}.${logoFileExtension}`;
  },
  // Files whois Site info (type: api / console)
  filePathWhoisSiteInfo({ type, domain }) {
    return `${basePathFiles}/whois/${type}/${domain}.json`;
  },
  // File Alexa Rank sites list
  filePathAlexaRank() {
    return `${basePathFiles}/alexa-rank.csv`;
  },
  // TMP
  // Path temporary file
  filePathTmp(fileName) {
    return `${global.ROOT_PATH}/tmp/${fileName}`;
  },
  // Path save temporary file
  saveTmpFile(fileName) {
    return this.filePathTmp(`${uuidv4()}${path.extname(fileName) || ''}`);
  },
};
