let {
  ADMIN__SERVICE,
  SITE__SERVICE,
  DB_MAIN__SERVICE,
  FILES__SERVICE,
  PROXY__SERVICE,
  API__PASSWORD_SALT,
} = process.env;

let $config = {
  services: {
    api: {
      blockingTimeMax: 3600, // sec
      serviceName: 'api', // API__NAME
      serviceType: 1,
      serviceRootPath: './',
    },
    admin: {
      serviceName: 'admin', // ADMIN__NAME
      serviceType: 2,
      serviceRootPath: `symlinks/${ADMIN__SERVICE}`,
    },
    site: {
      serviceName: 'site', // SITE__NAME
      serviceType: 3,
      serviceRootPath: `symlinks/${SITE__SERVICE}`,
    },
    files: {
      serviceName: 'files', // FILES__NAME
      serviceType: 4,
      serviceRootPath: `symlinks/${FILES__SERVICE}`,
    },
    dbMain: {
      serviceName: 'db-main', // DB_MAIN__NAME
      serviceType: 5,
      serviceRootPath: `symlinks/${DB_MAIN__SERVICE}`,
    },
    proxy: {
      serviceName: 'proxy', // DB_MAIN__NAME
      serviceType: 6,
      serviceRootPath: `symlinks/${PROXY__SERVICE}`,
    },
  },
  // translations
  translations: {
    cookieNameLangDefault: 'langDefault',
  },
  // These settings will be replaced with the settings from the database (These are initialization values, for "get"/"set" operations only "plugins/translations" should be used)
  settings: {
    langDefault: {
      admin: 'en', // admin + api
      api: 'en', // admin + api
      site: 'en',
    },
    langs: {
      admin: ['en'], // admin + api
      api: ['en'], // admin + api
      site: ['en'],
    },
    imageAppLogo: {
      site: '/images/app/site/logo.png',
      admin: '/images/app/admin/logo.png',
    },
    imageAppFavicon: {
      site: '/images/app/site/favicon.ico',
      admin: '/images/app/admin/favicon.ico',
    },
    imageAppPreloader: {
      site: '/images/app/site/preloader.png',
    },
    imageAppDefault: {
      site: '/images/app/site/default.png',
      admin: '/images/app/admin/default.png',
    },
    colorBodyBackground: {
      site: '#ffffff',
    },
    colorPrimary: {
      site: '#5a448d',
    },
    // For example, white on a purple background
    colorPrimaryInverted: {
      site: '#ffffff',
    },
    colorTextRegular: {
      site: '#222222',
    },
    colorSelectionBackground: {
      site: '#f88686',
    },
    colorSelectionText: {
      site: '#ffffff',
    },
    headStyles: {
      site: '',
    },
    headScript: {
      site: '',
    },
    headerInfoHtml: {
      site: '',
      admin: '',
    },
    headerHtml: {
      site: '',
    },
    contentTopHtml: {
      site: '',
    },
    footerHtml: {
      site: '',
    },
    contentBottomHtml: {
      site: '',
    },
    pageTitlePrefix: {
      site: '',
    },
    pageTitleSufix: {
      site: '',
    },
    backup: {
      api: {
        host: '',
        username: '',
        publicKey: '',
        publicKeyComment: 'service@newcatalog',
        port: 22,
        remoteDir: '',
      },
    },
    // This specifies the server url and the response that it must send in order to continue working with the service
    protector: {
      api: {
        url: '',
        textKey: '',
      },
    },
  },
  'settings-names': {
    langDefault: 'langDefault',
    langs: 'langs',
    imageAppLogo: 'imageAppLogo',
    imageAppFavicon: 'imageAppFavicon',
    imageAppPreloader: 'imageAppPreloader',
    imageAppDefault: 'imageAppDefault',
    colorBodyBackground: 'colorBodyBackground',
    colorPrimary: 'colorPrimary',
    colorPrimaryInverted: 'colorPrimaryInverted',
    colorTextRegular: 'colorTextRegular',
    colorSelectionBackground: 'colorSelectionBackground',
    colorSelectionText: 'colorSelectionText',
    headStyles: 'headStyles',
    headScript: 'headScript',
    headerInfoHtml: 'headerInfoHtml',
    headerHtml: 'headerHtml',
    contentTopHtml: 'contentTopHtml',
    contentBottomHtml: 'contentBottomHtml',
    footerHtml: 'footerHtml',
    pageTitlePrefix: 'pageTitlePrefix',
    pageTitleSufix: 'pageTitleSufix',
    backup: 'backup',
    protector: 'protector',
  },
  'settings-extends': {
    imageAppLogo: {
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    },
    imageAppFavicon: {
      mimeTypes: ['image/vnd.microsoft.icon', 'image/x-icon'],
    },
    imageAppPreloader: {
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    },
    imageAppDefault: {
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'],
    },
  },
  // Move to settings
  common: {
    maxRecordsPerPage: 20,
  },

  // users
  users: {
    emailLengthMin: 3,
    emailLengthMax: 255,
    passwordLengthMin: 6,
    passwordLengthMax: 20,
    loginAttemptMaxCount: 10,
    loginAttempTimaut: 600, // sec (Brute force)
    salt: API__PASSWORD_SALT,
    // If you change the mobile / desktop mode in the browser, the user agent will be changed. Therefore, the user will be kicked out of the system and he will not be able to log in for a while
    sessionMaxAge: 1200, // sec (The frontend periodically asks to update the key, during this time a request to update the key should come)
    tokenRefreshMinTime: 60, // sec
    cookieUserId: 'userId',
    cookieToken: 'token',
    emailDefault: 'default@newcatalog.email',
    passwordDefault: '123456',
    emailDemo: 'demo@newcatalog.email',
    passwordDemo: '123456',
    userAgentDemo:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36 newcatalog',
    sessionIdDemo: 'session-id-demo-mode',
    // These URLs can be accessed without authorization
    urlWithoutLogin: {
      '/api/users/login': true,
    },
  },
  // For authorization logging
  'users-auth-types': {
    login: 1,
    refresh: 2,
    attempt: 3,
    incorrect: 4,
    'another-device': 5,
    'log-out': 6,
    'refresh-incorrect': 7,
    'refresh-log-out': 8,
    'check-auth-error': 9,
  },
  // label
  label: {
    nameLengthMin: 1,
    nameLengthMax: 35,
    colorFormat: 'hex',
  },
  // ratings-items
  'ratings-items': {
    nameLengthMin: 0,
    nameLengthMax: 255,
    labelsIdsMin: 0,
    labelsIdsMax: 5,
  },
  // ratings
  ratings: {
    typeRating: {
      site: 1,
    },
    typeDisplay: {
      tile: 1,
      line: 2,
    },
    typeSort: {
      alexa: 1,
      click: 2,
    },
    sectionsIdsMin: 1,
    sectionsIdsMax: 2,
    nameLengthMin: 10,
    nameLengthMax: 120,
    descrLengthMin: 0,
    descrLengthMax: 1000,
  },
  // sections
  sections: {
    nameLengthMin: 2,
    nameLengthMax: 50,
  },
  // sites
  sites: {
    // Using in puppeteer and when creating a logo
    screenshotFileExtension: 'webp',
    logoFileExtension: 'jpg',
    logoMaxHeight: 100,
    logoMaxWidth: 200,
    // Sets the interval for checking for new entries in the database or and minimum whois check interval, etc.
    timeIntervalProcessSitesInfoUpdate: 1500,
    // If the site is not assigned Alexa Rank
    defaultAlexaRank: 10000000,
    screenshotMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  // puppeteer
  puppeteer: {
    viewportWidth: 1920,
    viewportHeight: 1080,
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36 newcatalog',
    extraHTTPHeaders: {
      'Accept-Language': 'en',
    },
    launch: {
      args: ['--lang=en-US,en', '--no-sandbox'],
    },
    defaultNavigationTimeout: 45000,
    // Sets the interval for checking for new entries in the database or the minimum interval between screenshots.
    timeIntervalScreenshotCreate: 1000,
  },
};

module.exports = JSON.parse(JSON.stringify($config));
