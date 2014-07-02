// Storing couchbase connections
var config = require('./config.js'),
    async = require('async'),
    chalk = require('chalk'),
    logger = require('../lib/log').api.logger,
    couchbase = require('couchbase'),
    actualBuckets = {},
    buckets = {};


function connectFn(i) {
  return function(cb) {
    var b = config.couchbase.buckets[i],
        params;

    // Announcing
    logger.verbose(chalk.blue(i) + ' connection through the ' +
                   chalk.yellow(b) + ' bucket.');

    if (b in actualBuckets) {
      buckets[i] = actualBuckets[b];
      cb(null);
    }
    else {
      params = {
        bucket: b,
        host: config.couchbase.host + ':' + config.couchbase.port
      };

      actualBuckets[b] = buckets[i] = new couchbase.Connection(
        params,
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
  for (i in config.couchbase.buckets)
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
  var mock = couchbase.Mock,
      i;

  logger.verbose('Pouf.js mode activated.');
  logger.verbose('Connection through a ' + chalk.yellow('mock') + ' bucket.');

  actualBuckets['test'] = new mock.Connection();

  for (i in config.couchbase.buckets)
    buckets[i] = actualBuckets['test'];

  next();
}

// Exporting connections
module.exports = {
  connect: config.couchbase.mock ? connectForTests : connect,
  connectForTests: connectForTests,
  buckets: buckets
};
