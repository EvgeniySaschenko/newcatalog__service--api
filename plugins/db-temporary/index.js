let alexa = require('./alexa');
let content = require('./content');
let settings = require('./settings');

module.exports = {
  $dbTemporary: {
    alexa,
    content,
    settings,
  },
};
