let alexa = require('./alexa');
let site = require('./site');
let api = require('./api');

module.exports = {
  $dbTemporary: {
    alexa,
    site,
    api,
  },
};
