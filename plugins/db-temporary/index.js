let alexa = require('./alexa');
let content = require('./content');

module.exports = {
  $dbTemporary: {
    alexa,
    content,
  },
};
