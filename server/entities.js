/**
 * TubeMyNet Entities Registration
 * ================================
 *
 * Instantiating any entities needed by the API server to run.
 */
var Entity = require('../lib/entity.js'),
    buckets = require('./buckets.js').buckets,
    schemas = require('./schemas.js');

// TODO: find more elegant way to do this
function init() {
  for (var i in buckets)
    exports[i] = new Entity(i, buckets[i], schemas[i]);
}

exports.init = init;
