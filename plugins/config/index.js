// not to calculate localesObject every time
let locales = ['ua', 'ru'];
let localesObject = (() => {
  return locales.reduce((total, key) => {
    total[key] = '';
    return total;
  }, {});
})();

let $config = {
  // lang
  lang: {
    default: 'ua',
    locales,
    localesObject,
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
    screenshotFileExtension: 'webp',
    logoFileExtension: 'jpg',
  },
};

module.exports = {
  $config,
};
