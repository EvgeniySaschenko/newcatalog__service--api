let langsMap = require('langs');
let { $config } = require(global.ROOT_PATH + '/plugins/config');
let keySiteLang = $config['settings-enum'].siteLang;
let keyAdminLang = $config['settings-enum'].adminLang;
let keySiteLangs = $config['settings-enum'].siteLangs;
let keyAdminLangs = $config['settings-enum'].adminLangs;

let langsTypes = {
  [keySiteLangs]: $config['settings'][keySiteLangs],
  [keyAdminLangs]: $config['settings'][keyAdminLangs],
};

let langsDefaultTypes = {
  [keySiteLang]: $config['settings'][keySiteLang],
  [keyAdminLang]: $config['settings'][keyAdminLang],
};
/*
   This function does not translate text, it is only used for parsing.
   This is done because if you do a translation based on cookies, you will need to pass the language as an additional parameter, and this is problematic
   Translations for the api-server, now only used for errors, so the desired function can be placed in the error class
*/
let $t = (text) => {
  return text;
};

let translationsList = {};

module.exports = {
  $t,
  // Utils
  $translations: {
    setTranslationsList({ translations }) {
      translationsList = translations;
    },

    // Translation function
    t({ text, lang }) {
      let langDefault = this.getLangDefault({ type: $config['settings-enum'].adminLang });
      let langs = this.getLans({ type: $config['settings-enum'].adminLangs });
      lang = lang || langDefault;
      let isLang = langs.includes(lang);
      if (!isLang) {
        lang = langDefault;
      }

      if (!translationsList[lang]) return text;
      return translationsList[lang][text] || text;
    },

    // Get lang default
    getLangDefault({ type }) {
      return langsDefaultTypes[type];
    },

    // Set lang default
    setLangDefault({ type, lang }) {
      langsDefaultTypes[type] = lang;
      return true;
    },

    // Get langs
    getLans({ type }) {
      return langsTypes[type];
    },

    // Set langs
    setLans({ type, langs }) {
      langsTypes[type] = langs;
      return true;
    },

    // Get langs object
    getLansObject({ type }) {
      let obj = {};
      for (let lang of langsTypes[type]) {
        obj[lang] = '';
      }
      return obj;
    },

    /*
    langs - Data. Must be passed in the format of an object whose keys match "$translations.getLans({ type })" 
    lengthMin - minimum text length,
    lengthMax = maximum text length
    locales = keys locales from compare
  */
    validateLansObject: ({ langs, lengthMin = 0, lengthMax = Infinity }) => {
      if (!langs) throw Error($t('Wrong data format')); // is empty
      if (typeof langs !== 'object') throw Error($t('Wrong data format')); // is wrong type
      if (Array.isArray(langs)) throw Error($t('Wrong data format')); // is wrong type

      // keys locales compare
      for (let key in langs) {
        if (langs[key].length < lengthMin || langs[key].length > lengthMax) {
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
