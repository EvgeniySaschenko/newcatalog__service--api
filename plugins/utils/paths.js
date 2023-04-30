let path = require('path');
let { v4: uuidv4 } = require('uuid');

const siteLogoUrlDefault = `/images/default-image.png`;
const { screenshotFileExtension, logoFileExtension } = global.$config['sites'];
const { FILES__SERVICE } = process.env;
const basePathFiles = `${global.ROOT_PATH}/symlinks/${FILES__SERVICE}`;

module.exports = {
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

  // APP FILES
  // - filePathApp... These functions return the path to upload images to the server
  filePathAppLogo: ({ serviceName, extension }) => {
    return `${basePathFiles}/images/app/${serviceName}/logo.${extension}`;
  },
  filePathAppPreloader: ({ serviceName, extension }) => {
    return `${basePathFiles}/images/app/${serviceName}/preloader.${extension}`;
  },
  filePathAppFavicon: ({ serviceName }) => {
    return `${basePathFiles}/images/app/${serviceName}/favicon.ico`;
  },

  // The path to app logo through a proxy
  fileProxyPathAppLogo: ({ serviceName, extension = null }) => {
    return `/images/app/${serviceName}/logo.${extension}`;
  },
  // The path to app preloader through a proxy
  fileProxyPathAppPreloader: ({ serviceName, extension = null }) => {
    return `/images/app/${serviceName}/preloader.${extension}`;
  },
  // The path to app favicon through a proxy
  fileProxyPathAppFavicon: ({ serviceName }) => {
    return `/images/app/${serviceName}/favicon.ico`;
  },

  // TMP
  // Path temporary file
  filePathTmp(fileName) {
    fileName = `${uuidv4()}${path.extname(fileName) || ''}`;
    return `${global.ROOT_PATH}/tmp/${fileName}`;
  },
};
