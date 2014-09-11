/**
 * TubeMyNet Space Unit Tests Setup
 * =================================
 *
 */
var async = require('async'),
    buckets = require('../server/buckets.js'),
    logger = require('../lib/log.js').api.logger,
    server = require('../server/api.js'),
    models = require('../server/models.js'),
    Model = require('../lib/model.js');

// Useful namespace
var test = {
  port: 6000,
  samples: {
    graph: {
      nodes: [
        {id: 'n01'},
        {id: 'n02'}
      ],
      edges: [
        {id: 'e01', source: 'n01', target: 'n02'}
      ]
    },
    metas: {
      author: 'Joachim Murat'
    }
  }
};

// Before all tests
before(function(done) {

  async.series({
    logger: function(next) {

      // TODO: find more elegant way to do this
      logger.remove(logger.transports.TubeMyNet);
      next();
    },
    buckets: function(next) {
      buckets.connectForTests(function() {
        test.bucket = buckets.buckets[Object.keys(buckets.buckets)[0]];
        models.init();
        next();
      });
    },
    server: function(next) {
      server.start(test.port);
      next();
    },
    models: function(next) {
      test.models = {
        user: new Model('user', test.bucket, {
          firstname: 'string',
          lastname: 'string'
        })
      };
      next();
    }
  }, done);
});

// Exporting for other files
module.exports = test;
