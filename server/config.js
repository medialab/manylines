/**
 * TubeMyNet Default Configuration
 * ================================
 *
 * Ensuring the configuration passed to the application respond to some
 * basic structure.
 *
 */
var config = require('../config.json'),
    utils = require('../lib/utils');

var defaults = {
  static: {
    path: 'static',
    port: 8000
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
      graph: 'manylines',
      narrative: 'manylines',
      space: 'manylines'
    }
  },
  log: {
    shell: true,
    file: false
  }
};

// Returning config merged with defaults
module.exports = utils.extend(config, defaults);
