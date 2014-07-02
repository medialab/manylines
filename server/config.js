var config = require('../config.json'),
    utils = require('../lib/utils');

var defaults = {
  static: {
    path: 'static',
    port: 8000,
    hello: 'world'
  },
  api: {
    port: 8080,
    secret: 's3cr3t'
  },
  couchbase: {
    mock: false,
    host: 'localhost',
    port: 8091,
    admin: 'admin',
    password: null,
    buckets: {
      snapshot: 'tubemynet',
      graphMeta: 'tubemynet',
      graph: 'tubemynet',
      space: 'tubemynet'
    }
  },
  log: {
    console: true,
    file: false
  }
};

// Returning config merged with defaultS
module.exports = utils.extend(config, defaults);
