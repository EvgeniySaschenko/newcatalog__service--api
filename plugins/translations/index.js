let langsMap = require('langs');
let { $config } = require(global.ROOT_PATH + '/plugins/config');

let langsTypes = {
  'site-langs': $config['settings']['site-langs'],
  'admin-langs': $config['settings']['admin-langs'],
};

let langsDefaultTypes = {
  'site-lang-default': $config['settings']['site-lang-default'],
  'admin-lang-default': $config['settings']['admin-lang-default'],
};

let $t = (str) => {
  return str;
};

module.exports = {
  // Function translate
  $t,
  // Utils
  $translations: {
    // Get lang default
    getLangDefault({ type }) {
      if (!langsDefaultTypes[type]) return false;
      return langsDefaultTypes[type];
    },

    // Set lang default
    setLangDefault({ type, lang }) {
      if (!langsDefaultTypes[type]) return false;
      langsDefaultTypes[type] = lang;
      return true;
    },

    // Get langs
    getLans({ type }) {
      console.log(langsMap.codes('1'));
      if (!langsTypes[type]) return false;
      return langsTypes[type];
    },

    // Set langs
    setLans({ type, langs }) {
      if (!langsTypes[type]) return false;
      langsTypes[type] = langs;
      return true;
    },

    // Get langs object
    getLansObject({ type }) {
      if (!langsTypes[type]) return false;
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
