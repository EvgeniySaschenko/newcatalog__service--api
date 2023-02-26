let $dbMain = {
  sections: require('./sections'),
  ratings: require('./ratings'),
  labels: require('./labels'),
  'sites-screenshots': require('./sites-screenshots'),
  sites: require('./sites'),
  'ratings-items': require('./ratings-items'),
  'records-deleted': require('./records-deleted'),
  'cache-info': require('./cache-info'),
};

module.exports = {
  $dbMain,
};
