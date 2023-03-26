let tldts = require('tldts');
let jwt = require('jsonwebtoken');
let { v4: uuidv4 } = require('uuid');
let { $dbTemporary } = require(global.ROOT_PATH + '/plugins/db-temporary');

let $utils = {
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

  // Create token
  async createToken({ data, expiresIn }) {
    let tokenSecretKey = await $dbTemporary['settings'].getServiceApiTokenSecretKey();
    if (!tokenSecretKey) {
      tokenSecretKey = uuidv4();
      await $dbTemporary['settings'].addServiceApiTokenSecretKey(tokenSecretKey);
    }

    let token = jwt.sign(
      {
        data,
      },
      tokenSecretKey,
      { expiresIn }
    );

    return token;
  },

  // Get token
  async getTokenData({ token }) {
    let tokenSecretKey = await $dbTemporary['settings'].getServiceApiTokenSecretKey();

    let data;
    jwt.verify(token, tokenSecretKey, function (err, decoded) {
      if (err) {
        data = false;
      }

      data = decoded?.data || false;
    });
    return data;
  },
};

module.exports = {
  $utils,
};
