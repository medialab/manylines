// Storing couchbase connections
var config = require('./config.js'),
    async = require('async'),
    logger = require('../lib/log').api.logger,
    couchbase = require('couchbase'),
    actualBuckets = {},
    buckets = {};


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

function connectForTests(next) {
  var mock = require('couchbase').Mock,
      i;

  actualBuckets['test'] = new mock.Connection();

  for (i in config.buckets)
    buckets[i] = actualBuckets['test'];

  next();
}

// Exporting connections
module.exports = {
  connect: connect,
  connectForTests: connectForTests,
  buckets: buckets
};
