let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $regexp } = require(global.ROOT_PATH + '/plugins/regexp');
let { $translations } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let fse = require('fs-extra');
let path = require('path');

class Translations {
  // Regexps from search $t("text")
  regexpsTranslations = $regexp.translations;

  // Paths exclude
  pathsExclude = {
    node_modules: true,
    '.dockerignore': true,
    '.git': true,
    '.npmrc': true,
    '.prettierignore': true,
    '.vscode': true,
    'README.md': true,
    'package.json': true,
    'tsconfig.json': true,
    '.eslintrc.js': true,
    '.gitignore': true,
    '.nuxt': true,
    '.prettierrc.js': true,
    Dockerfile: true,
    'package-lock.json': true,
    public: true,
    data: true,
    symlinks: true,
  };

  // Files extension allowed
  filesExtensionAllowed = {
    vue: true,
    js: true,
    ts: true,
  };

  // Files list
  filesPathsList = [];

  // Translations
  translations = {};

  // Create translitiosn for service + delete no used
  async runCreateTranslations({
    serviceRootPath = './',
    pathsExclude = {},
    filesExtensionAllowed = {},
    serviceType,
  }) {
    Object.assign(this.pathsExclude, pathsExclude);
    Object.assign(this.filesExtensionAllowed, filesExtensionAllowed);
    await this.prepareFilesPathsList({ serviceRootPath });
    await this.prepareTranslationsList();
    await this.createTranslationsKeys({ serviceType });
    await this.deleteNoUsedTranslationsKeys({ serviceType });
    await this.setTranslationsListServiceApi();
    return true;
  }

  // Prepare files paths list
  async prepareFilesPathsList({ serviceRootPath }) {
    let pathsList = await fse.readdir(serviceRootPath);

    for await (let item of pathsList) {
      if (this.pathsExclude[item]) continue;
      let pathCurrent = `${serviceRootPath}/${item}`;

      let isDirectory = fse.statSync(pathCurrent).isDirectory();

      if (isDirectory) {
        let namesListInside = await fse.readdir(pathCurrent);
        for (let itemInside of namesListInside) {
          pathsList.push(`${item}/${itemInside}`);
        }
      } else {
        let pathFile = `${serviceRootPath}/${item}`;
        let extname = path.extname(pathFile).replace('.', '');
        if (!this.filesExtensionAllowed[extname]) continue;
        this.filesPathsList.push(pathFile);
      }
    }
  }

  // Prepare translations list
  async prepareTranslationsList() {
    for await (let pathFile of this.filesPathsList) {
      let content = await fse.readFile(pathFile, 'utf8');
      let translations = [];
      for (let regExp of this.regexpsTranslations) {
        let result = content.match(new RegExp(regExp, 'g'));
        if (result) {
          translations = [...translations, ...result];
        }
      }
      for (let item of translations) {
        this.translations[item] = item;
      }
    }
  }

  // Add translations keys to db
  async createTranslationsKeys({ serviceType }) {
    for await (let key of Object.keys(this.translations)) {
      let result = await $dbMain['translations'].getTranslationByKeyAndType({
        key,
        serviceType,
      });
      if (!result) {
        await $dbMain['translations'].createTranslationKey({ key, serviceType });
      }
    }
    return true;
  }

  // Delete no used translations keys
  async deleteNoUsedTranslationsKeys({ serviceType }) {
    let count = await $dbMain['translations'].getTranslationsCountByType({ serviceType });
    let translationsDb = await this.getTranslationsForService({
      serviceType,
      maxRecordsPerPage: count,
      page: 1,
    });

    for await (let item of translationsDb.items) {
      if (!this.translations[item.key]) {
        await $dbMain['records-deleted'].createRecords({
          tableName: $dbMain['translations'].tableName,
          tableId: item.translationId,
          tableRecord: item,
        });
        await $dbMain['translations'].deleteTranslationByKeyAndType({
          key: item.key,
          serviceType,
        });
      }
    }
  }

  // Get translations service
  async getTranslationsForService({
    serviceType,
    maxRecordsPerPage = global.$config['translations'].maxRecordsPerPage,
    page = 1,
  }) {
    let offset = (page - 1) * maxRecordsPerPage;

    let count = await $dbMain['translations'].getTranslationsCountByType({
      serviceType,
    });
    let translations = await $dbMain['translations'].getTranslationsByType({
      serviceType,
      limit: maxRecordsPerPage,
      offset,
    });

    let pagesCount = Math.ceil(count / maxRecordsPerPage);

    return {
      page,
      pagesCount,
      maxRecordsPerPage,
      itemsCount: count,
      items: translations,
    };
  }

  // Get translations for "service" to be used by the translation function "$t"
  async getTranslationsForFunctionTranslate({ serviceName, serviceType }) {
    let translations = {};
    let count = await $dbMain['translations'].getTranslationsCountByType({ serviceType });
    let translationsDb = await this.getTranslationsForService({
      serviceType,
      maxRecordsPerPage: count,
      page: 1,
    });
    let langs = $translations.getLangs({ serviceName });
    for (let lang of langs) {
      translations[lang] = {};
    }

    if (!translationsDb?.items) return translations;

    for (let { text, key } of translationsDb.items) {
      for (let lang of langs) {
        translations[lang][key] = text[lang] || '';
      }
    }

    return translations;
  }

  // Set translations for service api (Fired during initialization and when updating translations of any service)
  async setTranslationsListServiceApi() {
    let { serviceType } = global.$config['services'].api;
    let { serviceName } = global.$config['services'].admin; // admin - because $translations.getLangs({ serviceName });
    let translations = await this.getTranslationsForFunctionTranslate({
      serviceName,
      serviceType,
    });

    $translations.setTranslationsList({ translations });
    return translations;
  }

  // Update text for translation
  async editText({ translationId, text }) {
    return await $dbMain['translations'].editTextById({ translationId, text });
  }

  // Run edit text - This wrapper is needed to store API translations in Node.js memory
  async runEditText({ translationId, text, serviceName }) {
    let result = await this.editText({ translationId, text });
    if (global.$config['services'].api.serviceName === serviceName) {
      await this.setTranslationsListServiceApi();
    }
    if (!result) $utils['errors'].serverMessage();
    return true;
  }
}

module.exports = Translations;
