/* eslint-disable no-useless-escape */
let { $dbMain } = require(global.ROOT_PATH + '/plugins/db-main');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let fse = require('fs-extra');
let path = require('path');

class Translations {
  // Regexps from search $t("text")
  regexpsTranslate = [
    /(?<=\$t\(\")(.*?)(?=\"\))/,
    /(?<=\$t\(')(.*?)(?='\))/,
    /(?<=\$t\(`)(.*?)(?=`\))/,
  ];

  // Path root
  pathRoot = './';

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

  // Type (for db)
  typeTranslition = '';

  // Create translitiosn for service + delete no used
  async runCreateTranslitions({ pathRoot, pathsExclude = {}, filesExtensionAllowed = {}, type }) {
    this.pathRoot = pathRoot;
    this.typeTranslition = type;
    Object.assign(this.pathsExclude, pathsExclude);
    Object.assign(this.filesExtensionAllowed, filesExtensionAllowed);
    await this.prepareFilesPathsList();
    await this.prepareTranslationsList();
    await this.createTranslationsKeys();
    await this.deleteNoUsedTranslitionsKeys();
    return true;
  }

  // Prepare files paths list
  async prepareFilesPathsList() {
    let pathsList = await fse.readdir(this.pathRoot);

    for await (let item of pathsList) {
      if (this.pathsExclude[item]) continue;
      let pathCurrent = `${this.pathRoot}/${item}`;

      let isDirectory = fse.statSync(pathCurrent).isDirectory();

      if (isDirectory) {
        let namesListInside = await fse.readdir(pathCurrent);
        for (let itemInside of namesListInside) {
          pathsList.push(`${item}/${itemInside}`);
        }
      } else {
        let pathFile = `${this.pathRoot}/${item}`;
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
      for (let regExp of this.regexpsTranslate) {
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
  async createTranslationsKeys() {
    let type = this.typeTranslition;
    for await (let key of Object.keys(this.translations)) {
      let result = await $dbMain['translations'].getTranslationByKeyAndType({ key, type });
      if (!result) {
        await $dbMain['translations'].createTranslationKey({ key, type });
      }
    }
    return true;
  }

  // Delete no used translitions keys
  async deleteNoUsedTranslitionsKeys() {
    let type = this.typeTranslition;
    let count = await $dbMain['translations'].getTranslationsCountByType({ type });
    let translationsDb = await this.getTranslationsForService({
      type,
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
        await $dbMain['translations'].deleteTranslationByKeyAndType({ key: item.key, type });
      }
    }
  }

  // Get translations service
  async getTranslationsForService({
    type,
    maxRecordsPerPage = $config.translations.maxRecordsPerPage,
    page = 1,
  }) {
    let offset = (page - 1) * maxRecordsPerPage;

    let count = await $dbMain['translations'].getTranslationsCountByType({
      type,
    });
    let translations = await $dbMain['translations'].getTranslationsByType({
      type,
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

  // Update text for translation
  async updateText({ translationId, text }) {
    await $dbMain['translations'].updateTextById({ translationId, text });
    return true;
  }
}

module.exports = Translations;
