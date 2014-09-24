/**
 * TubeMyNet Space Unit Tests Setup
 * =================================
 *
 */
var async = require('async'),
    buckets = require('../server/buckets.js'),
    logger = require('../lib/log.js').api.logger,
    server = require('../server/api.js'),
    entities = require('../server/entities.js'),
    Entity = require('../lib/entity.js');

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
    meta: {
      author: 'Joachim Murat'
    },
    snapshot: {
      view: {
        camera: {
          x: 30.2,
          y: 14.5,
          ratio: 0.3
        }
      },
      filters: [
        {category: 'whatever', values: ['a', 'b']}
      ]
    },
    narrative: {
      title: 'My fancy narrative.',
      slides: [
        {
          snapshot: null,
          title: 'My first slide.',
          text: 'I have so many interesting things to say.'
        }
      ]
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
        entities.init();
        next();
      });
    },
    server: function(next) {
      server.start(test.port);
      next();
    },
    entities: function(next) {
      test.entities = {
        user: new Entity('user', test.bucket, {
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
