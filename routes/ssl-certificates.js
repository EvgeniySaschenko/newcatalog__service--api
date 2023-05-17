let express = require('express');
let router = express.Router();
let { $utils } = require(global.ROOT_PATH + '/plugins/utils');
let SslCertificates = require(global.ROOT_PATH + '/class/ssl-certificates');

// Add ssl certificate
router.put('/', async (request, response, next) => {
  let result;
  try {
    $utils['errors'].serverMessageDemoMode();
    let sslCertificates = new SslCertificates();
    result = await sslCertificates.editSslCertificate(request.body);
  } catch (error) {
    result = $utils['errors'].createResponse({ request, error });
    response.status(result.status);
  }
  response.send(result);
});

module.exports = router;
