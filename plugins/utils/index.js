let common = require('./common');
let users = require('./users');
let paths = require('./paths');
let errors = require('./errors');
let service = require('./service');

module.exports = {
  $utils: {
    common,
    users,
    paths,
    errors,
    service,
  },
};
