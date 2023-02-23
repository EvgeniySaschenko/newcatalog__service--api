let { $t } = require(global.ROOT_PATH + '/plugins/translate');
let { $config } = require(global.ROOT_PATH + '/plugins/config');

let $errors = {
  //
  'Wrong data format': $t('Wrong data format'),
  //
  'String length range': (lengthMin, lengthMax) => {
    return `${$t('The number of characters in a string must be in the range:')} 
    ${lengthMin} - ${lengthMax}`;
  },
  //
  'The number of elements can be in the range': (countMin, countMax) => {
    return `${$t('The number of elements can be in the range:')} 
    ${countMin} - ${countMax}`;
  },
  //
  'Color value must be in HEX format': $t('Color value must be in HEX format'),
  //
  'The link must start with "http" or "https"': $t('The link must start with "http" or "https"'),
  //
  'There is no such id': $t('There is no such id'),
  //
  'A label with the same name already exists': $t('A label with the same name already exists'),
  //
  'This url is already in the ranking': $t('This url is already in the ranking'),
  //
  'Server error': $t('Server error'),
  //
  'Not enough data': $t('Not enough data'),
  //
  'This site is currently in the screenshot queue': $t(
    'This site is currently in the screenshot queue'
  ),
  //
  'Invalid file': $t('Invalid file'),
  //
  'You can not delete a section that has ratings': $t(
    'You can not delete a section that has ratings'
  ),
  //
  'You can not remove a rating that has sites or labels': $t(
    'You can not remove a rating that has sites or labels'
  ),
};

let $errorsUtils = {
  /*
    langs - Data. Must be passed in the format of an object whose keys match "$config.locales" 
    lengthMin - minimum text length,
    lengthMax = maximum text length
    locales = keys locales from compare
  */
  validateLans: ({
    langs,
    lengthMin = 0,
    lengthMax = Infinity,
    locales = $config.lang.locales,
  }) => {
    if (!langs) throw Error($errors['Wrong data format']); // is empty
    if (typeof langs !== 'object') throw Error($errors['Wrong data format']); // is wrong type
    if (Array.isArray(langs)) throw Error($errors['Wrong data format']); // is wrong type
    if (Object.keys(langs).sort().toString() !== locales.sort().toString()) {
      throw Error($errors['Wrong data format']); // is wrong keys
    }
    // keys locales compare
    for (let key in langs) {
      if (langs[key].length < lengthMin || langs[key].length > lengthMax) {
        throw Error($errors['String length range'](lengthMin, lengthMax));
      }
    }
  },

  validateDependencyIds: ({ ids, numberMin, numberMax }) => {
    // type
    if (typeof ids !== 'object' || Array.isArray(ids)) {
      throw Error($errors['Wrong data format']);
    }

    // data
    for (let key in ids) {
      if (!+key || !Number.isInteger(+key) || key != ids[key]) {
        throw Error($errors['Wrong data format']);
      }
    }

    // number
    let numberIds = Object.keys(ids).length;

    if (numberIds < numberMin || numberIds > numberMax) {
      throw Error($errors['The number of elements can be in the range'](numberMin, numberMax));
    }
  },
};

module.exports = {
  $errors,
  $errorsUtils,
};
