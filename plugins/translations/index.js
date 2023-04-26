let langsMap = require('langs');
let serviceSite = global.$config['services'].site;
let serviceAdmin = global.$config['services'].admin;
let serviceApi = global.$config['services'].api;
let settings = global.$config['settings'];

let langsTypes = {
  [serviceSite.serviceName]: settings.langs[serviceSite.serviceName],
  [serviceAdmin.serviceName]: settings.langs[serviceAdmin.serviceName],
  [serviceApi.serviceName]: settings.langs[serviceApi.serviceName],
};

let langsDefaultTypes = {
  [serviceSite.serviceName]: settings.langDefault[serviceSite.serviceName],
  [serviceAdmin.serviceName]: settings.langDefault[serviceAdmin.serviceName],
  [serviceApi.serviceName]: settings.langDefault[serviceApi.serviceName],
};

// This function does not translate, it is only used when parsing a project to create translations.
let $t = (text) => {
  return text;
};

let translationsList = {};

let $translations = {
  $t,
  // Utils
  $translations: {
    setTranslationsList({ translations }) {
      translationsList = translations;
    },

    // Translation function
    t(text, lang) {
      let { serviceName } = serviceApi;
      let langDefault = this.getLangDefault({ serviceName });
      let langs = this.getLangs({ serviceName });
      lang = lang || langDefault;
      let isLang = langs.includes(lang);
      if (!isLang) {
        lang = langDefault;
      }

      if (!translationsList[lang]) return text;
      return translationsList[lang][text] || text;
    },

    // Get lang default
    getLangDefault({ serviceName }) {
      return langsDefaultTypes[serviceName];
    },

    // Set lang default
    setLangDefault({ serviceName, langDefault }) {
      langsDefaultTypes[serviceName] = langDefault;
      return langsDefaultTypes[serviceName];
    },

    // Get langs
    getLangs({ serviceName }) {
      return langsTypes[serviceName];
    },

    // Set langs
    setLangs({ serviceName, langs }) {
      langsTypes[serviceName] = langs;
      return langsTypes[serviceName];
    },

    // Get langs object
    getLangsObject({ serviceName }) {
      let obj = {};
      for (let lang of langsTypes[serviceName]) {
        obj[lang] = '';
      }
      return obj;
    },

    /*
    translations - Data. Must be passed in the format of an object whose keys match "$translations.getLangs({ serviceName })" 
    lengthMin - minimum text length,
    lengthMax = maximum text length
    langs = keys langs from compare (aray)
  */
    validateLangsObject({ translations, lengthMin = 0, lengthMax = Infinity, langs }) {
      if (!langs) {
        langs = this.getLangs({ serviceName: serviceSite.serviceName });
      }

      if (!translations) throw Error($t('Wrong data format')); // is empty
      if (typeof translations !== 'object') throw Error($t('Wrong data format')); // is wrong type
      if (Array.isArray(translations)) throw Error($t('Wrong data format')); // is wrong type

      // keys langs compare
      for (let key of langs) {
        if (!translations[key]) {
          translations[key] = ''; // Fields may be optional
        }

        if (translations[key].length < lengthMin || translations[key].length > lengthMax) {
          // eslint-disable-next-line prettier/prettier
          throw Error(`${$t('The number of characters in a string must be in the range:')}  ${lengthMin} - ${lengthMax}`);
        }
        if (!langsMap.has('1', key)) {
          throw Error($t('Not exist ISO key'));
        }
      }
    },
  },
};

module.exports = $translations;
