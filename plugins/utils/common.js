let tldts = require('tldts');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');

module.exports = {
  // Get info from domain
  urlInfo(url) {
    let {
      hostname,
      subdomain,
      domain,
      domainWithoutSuffix,
      isIcann,
      isIp,
      isPrivate,
      publicSuffix,
    } = tldts.parse(url);
    let isSubdomain = subdomain && subdomain !== 'www';

    if (subdomain === 'www') {
      hostname = domain;
    }

    return {
      hostname,
      subdomain,
      domain,
      isSubdomain,
      domainWithoutSuffix,
      isIcann,
      isIp,
      isPrivate,
      publicSuffix,
    };
  },

  // Calculate maximum dimensions of an image
  сalcmMaxDimensionsImage({ height, width, maxHeight, maxWidth }) {
    let coefH = height / maxHeight;
    let coefW = width / maxWidth;
    let newWidth;
    let newHeight;

    if (coefW > 1) {
      newWidth = width / coefW;
      newHeight = height / coefW;
      coefH = newHeight / maxHeight;
      if (coefH > 1) {
        newWidth = newWidth / coefH;
        newHeight = newHeight / coefH;
      }
    } else if (coefH > 1) {
      newHeight = height / coefH;
      newWidth = width / coefH;
      coefW = newWidth / maxWidth;
      if (coefW > 1) {
        newWidth = newWidth / coefW;
        newHeight = newHeight / coefW;
      }
    }

    return {
      width: newWidth || width,
      height: newHeight || height,
    };
  },

  // Validation of an object with an id - used when adding to the database
  validateDependencyIds: ({ ids, numberMin, numberMax }) => {
    // type
    if (typeof ids !== 'object' || Array.isArray(ids)) {
      throw Error($t('Wrong data format'));
    }

    // data
    for (let key in ids) {
      if (!+key || !Number.isInteger(+key) || key != ids[key]) {
        throw Error($t('Wrong data format'));
      }
    }

    // number
    let numberIds = Object.keys(ids).length;

    if (numberIds < numberMin || numberIds > numberMax) {
      let text = $t('The number of elements can be in the range:');
      let range = `${numberMin} - ${numberMax}`;
      throw Error(`${text} ${range}`);
    }
  },
};
