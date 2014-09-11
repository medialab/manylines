/**
 * TubeMyNet Model Registration
 * =============================
 *
 * Instantiating any model needed by the API server to run.
 */
var Model = require('../lib/model.js'),
    buckets = require('./buckets.js').buckets,
    schemas = require('./schemas.js');

// TODO: find more elegant way to do this
function init() {
  for (var i in buckets)
    exports[i] = new Model(i, buckets[i], schemas[i]);
}

exports.init = init;
