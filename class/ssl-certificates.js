let { validateSSLKey, validateSSLCert, validateCertKeyPair } = require('ssl-validator');

let fse = require('fs-extra');
let { PROXY__SSL_CERT_SITE, PROXY__SSL_KEY_SITE, PROXY__SSL_CERT_ADMIN, PROXY__SSL_KEY_ADMIN } =
  process.env;
let { $t } = require(global.ROOT_PATH + '/plugins/translations');
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let services = global.$config['services'];

class SslCertificates {
  adminCertPath = `${services.proxy.serviceRootPath}/${PROXY__SSL_CERT_ADMIN}`;
  adminKeyPath = `${services.proxy.serviceRootPath}/${PROXY__SSL_KEY_ADMIN}`;
  siteCertPath = `${services.proxy.serviceRootPath}/${PROXY__SSL_CERT_SITE}`;
  siteKeyPath = `${services.proxy.serviceRootPath}/${PROXY__SSL_KEY_SITE}`;

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

    switch (serviceName) {
      case services.admin.serviceName: {
        await fse.writeFile(this.adminCertPath, cert, 'utf8');
        await fse.writeFile(this.adminKeyPath, privateKey, 'utf8');
        break;
      }
      case services.site.serviceName: {
        await fse.writeFile(this.siteCertPath, cert, 'utf8');
        await fse.writeFile(this.siteKeyPath, privateKey, 'utf8');
        break;
      }
      default: {
        $utils['errors'].validationMessage({
          path: 'serviceName',
          message: $t('Select a service name from the list'),
        });
      }
    }
    return true;
  }
}

module.exports = SslCertificates;
