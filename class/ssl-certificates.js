let { validateSSLKey, validateSSLCert, validateCertKeyPair } = require('ssl-validator');

let fse = require('fs-extra');
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');

class SslCertificates {
  // Edit ssl certificate
  async editSslCertificate({ cert, privateKey, serviceName }) {
    try {
      await validateSSLCert(cert, { skipDateValidation: true });
    } catch (error) {
      $utils['errors'].validationMessage({
        path: 'cert',
        message: $t('Invalid SSL certificate'),
      });
    }

    try {
      await validateSSLKey(privateKey);
    } catch (error) {
      $utils['errors'].validationMessage({
        path: 'privateKey',
        message: $t('Invalid SSL private key'),
      });
    }

    try {
      await validateCertKeyPair(cert, privateKey, { skipDateValidation: true });
    } catch (error) {
      $utils['errors'].validationMessage({
        path: 'privateKey',
        message: $t('Private key and certificate do not match'),
      });
    }

    let sslPaths = $utils['paths'].sslPaths({ serviceName });

    if (sslPaths) {
      await fse.writeFile(sslPaths.cert, cert, 'utf8');
      await fse.writeFile(sslPaths.key, privateKey, 'utf8');
      return true;
    }

    $utils['errors'].validationMessage({
      path: 'serviceName',
      message: $t('Select a service name from the list'),
    });
  }
}

module.exports = SslCertificates;
