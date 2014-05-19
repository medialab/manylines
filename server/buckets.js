// Storing couchbase connections
var config = require('./config.js'),
    async = require('async'),
    logger = require('../lib/log').api.logger,
    couchbase = require('couchbase'),
    buckets = {},
    actualBuckets = {};

function connectFn(i) {
  return function(cb) {
    var b = config.buckets[i];

    // Announcing
    logger.verbose(i.blue + ' connection through the ' +
                   b.yellow + ' bucket.');

    if (b in actualBuckets) {
      buckets[i] = actualBuckets[b];
      cb(null);
    }
    else {
      actualBuckets[b] = buckets[i] = new couchbase.Connection(
        {
          bucket: b
        },
        function(err) {
          if (err)
            cb(err);
          else
            cb(null);
        }
      );
    }
  }
}

function connect(next) {
  var connectFunctions = [],
      i;

  // Functions to be run by async
  for (i in config.buckets)
    connectFunctions.push(connectFn(i));

  // Opening buckets connection
  async.series(connectFunctions, function(err) {
    if (err) {
      throw 'api.db.connection: error while trying to connect to couchbase buckets.';
    }
    next();
  });
}

// Exporting connections
module.exports = {
  connect: connect,
  buckets: buckets
};
