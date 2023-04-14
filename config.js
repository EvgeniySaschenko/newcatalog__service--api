let { ADMIN__SERVICE, SITE__SERVICE } = process.env;
let services = {
  api: {
    serviceName: 'api',
    serviceType: 1,
    serviceRootPath: './',
  },
  admin: {
    serviceName: 'admin',
    serviceType: 2,
    serviceRootPath: `symlinks/${ADMIN__SERVICE}`,
  },
  site: {
    serviceName: 'site',
    serviceType: 3,
    serviceRootPath: `symlinks/${SITE__SERVICE}`,
  },
};

let $config = {
  services: {
    api: services['api'],
    admin: services['admin'],
    site: services['site'],
  },
  'services-types': {
    1: services['api'],
    2: services['admin'],
    3: services['site'],
  },
  // translations
  translations: {
    maxRecordsPerPage: 20,
    cookieNameLangDefault: 'langDefault',
  },
  // These settings will be replaced with the settings from the database (These are initialization values, for "get"/"set" operations only "plugins/translations" should be used)

  settings: {
    langDefault: {
      // api: 'en',
      admin: 'en',
      site: 'en',
    },
    langs: {
      // api: ['en'],
      admin: ['en'],
      site: ['en'],
    },
  },
  'settings-names': {
    langDefault: 'langDefault',
    langs: 'langs',
  },
  // users
  users: {
    emailLengthMin: 3,
    emailLengthMax: 255,
    passwordLengthMin: 6,
    passwordLengthMax: 20,
    loginAttemptMaxCount: 5,
    loginAttempTimaut: 600, // sec (Brute force)
    salt: 'dgkdfsjg;kdfjsgkj53',
    // If you change the mobile / desktop mode in the browser, the user agent will be changed. Therefore, the user will be kicked out of the system and he will not be able to log in for a while
    sessionMaxAge: 1200, // sec (The frontend periodically asks to update the key, during this time a request to update the key should come)
    cookieUserId: 'userId',
    cookieToken: 'token',
    emailDefault: 'test@test.com',
    passwordDefault: '123456',
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
    viewportWidth: 1600,
    viewportHeight: 900,
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
    extraHTTPHeaders: {
      'Accept-Language': 'en',
    },
    launch: {
      args: ['--lang=en-US,en', '--no-sandbox'],
    },
    defaultNavigationTimeout: 60000,
    // Sets the interval for checking for new entries in the database or the minimum interval between screenshots.
    timeIntervalScreenshotCreate: 1000,
  },
};

module.exports = JSON.parse(JSON.stringify($config));
