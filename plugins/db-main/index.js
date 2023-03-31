let $dbMain = {
  sections: require('./sections'),
  ratings: require('./ratings'),
  labels: require('./labels'),
  'sites-screenshots': require('./sites-screenshots'),
  sites: require('./sites'),
  'ratings-items': require('./ratings-items'),
  'records-deleted': require('./records-deleted'),
  users: require('./users'),
  'users-auth': require('./users-auth'),
  settings: require('./settings'),
  translations: require('./translations'),
};

module.exports = {
  $dbMain,
};
