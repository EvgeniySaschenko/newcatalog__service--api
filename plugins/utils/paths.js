let path = require('path');
let { v4: uuidv4 } = require('uuid');

const { screenshotFileExtension, logoFileExtension } = global.$config['sites'];
const { DB_MAIN__BACKUP_REPORT_PATH, DB_MAIN__BACKUP_IS_RUN_PATH, DB_MAIN__BACKUP_DIR } =
  process.env;
let services = global.$config['services'];

const basePathFiles = `${global.ROOT_PATH}/${services.files.serviceRootPath}`;
const basePathDbMain = `${global.ROOT_PATH}/${services.dbMain.serviceRootPath}`;

module.exports = {
  // Path images
  dirPathImages: () => {
    return `${basePathFiles}/images`;
  },
  // Path screenshot
  filePathScreenshot: ({ siteScreenshotId }) => {
    return `${basePathFiles}/images/site-screenshots/${siteScreenshotId}.${screenshotFileExtension}`;
  },
  // Path site logo
  filePathSiteLogo: ({ siteLogoId }) => {
    return `${basePathFiles}/images/site-logos/${siteLogoId}.${logoFileExtension}`;
  },
  // Path whois
  dirPathWhois: () => {
    return `${basePathFiles}/whois`;
  },
  // Files whois Site info (type: api / console)
  filePathWhoisSiteInfo({ type, domain }) {
    return `${this.dirPathWhois()}/${type}/${domain}.json`;
  },

  // File Alexa Rank sites list
  filePathAlexaRank() {
    return `${basePathFiles}/alexa-rank.csv`;
  },

  // APP IMAGES
  // - filePathApp... These functions return the path to upload images to the server
  filePathAppLogo: ({ serviceName, extension }) => {
    return `${basePathFiles}/images/app/${serviceName}/logo.${extension}`;
  },
  filePathAppPreloader: ({ serviceName, extension }) => {
    return `${basePathFiles}/images/app/${serviceName}/preloader.${extension}`;
  },
  filePathAppImageDefault: ({ serviceName, extension }) => {
    return `${basePathFiles}/images/app/${serviceName}/default.${extension}`;
  },
  filePathAppFavicon: ({ serviceName }) => {
    return `${basePathFiles}/images/app/${serviceName}/favicon.ico`;
  },

  // DB BACKUP
  // Path db main backup
  dirPathDbMainBackup: () => {
    return `${basePathDbMain}/${DB_MAIN__BACKUP_DIR}`;
  },
  // The file specifies whether to back up
  filePathDbMainIsRun: () => {
    return `${basePathDbMain}/${DB_MAIN__BACKUP_IS_RUN_PATH}`;
  },
  // Db main report
  filePathDbMainReport: () => {
    return `${basePathDbMain}/${DB_MAIN__BACKUP_REPORT_PATH}`;
  },

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
      : '/images/site-logos';
  },

  // The path to app logo through a proxy
  fileProxyPathAppLogo: ({ serviceName, extension = null }) => {
    return `/images/app/${serviceName}/logo.${extension}`;
  },
  // The path to app preloader through a proxy
  fileProxyPathAppPreloader: ({ serviceName, extension = null }) => {
    return `/images/app/${serviceName}/preloader.${extension}`;
  },
  // The path to app image default through a proxy
  fileProxyPathAppImageDefault: ({ serviceName, extension = null }) => {
    return `/images/app/${serviceName}/default.${extension}`;
  },
  // The path to app favicon through a proxy
  fileProxyPathAppFavicon: ({ serviceName }) => {
    return `/images/app/${serviceName}/favicon.ico`;
  },

  // TMP
  // Creates a path to a new temporary directory
  dirPathTmpDir() {
    return `${global.ROOT_PATH}/tmp/${uuidv4()}`;
  },

  // Path temporary file
  filePathTmp(fileName) {
    fileName = `${uuidv4()}${path.extname(fileName) || ''}`;
    return `${global.ROOT_PATH}/tmp/${fileName}`;
  },
};
