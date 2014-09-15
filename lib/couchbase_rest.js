/**
 * TubeMyNet Couchbase REST abstraction
 * =====================================
 *
 * This REST abstraction is used by some scripts to facilitate both
 * the application's deployment and development.
 */
var request = require('request'),
    utils = require('./utils.js');

function CouchbaseREST(config) {

  // Properties
  this.config = config;
  this.endpoint =
    'http://' + this.config.host + ':' + this.config.port + '/pools/default';

  // Default data
  this.auth = {
    user: this.config.admin,
    pass: this.config.password,
    sendImmediately: false
  };

  this.defaultBucketOptions = {
    authType: 'none',
    bucketType: 'couchbase',
    flushEnabled: 1,
    ramQuotaMB: 4618,
    replicaNumber: 0,
    proxyPort: 11215
  };

  // Methods
  this.getBucket = function(name, cb) {
    request.get(
      this.endpoint + '/buckets/' + name,
      {
        auth: this.auth
      },
      function(err, res, body) {
        if (res.statusCode === 404)
          cb(err, null);
        else
          cb(err, body);
      }
    );
  };

  this.createBucket = function(name, cb) {
    request.post(
      this.endpoint + '/buckets',
      {
        auth: this.auth,
        form: utils.extend({name: name}, this.defaultBucketOptions)
      },
      cb
    );
  };

  this.flushBucket = function(name, cb) {
    request.post(
      this.endpoint + '/buckets/' + name + '/controller/doFlush',
      {
        auth: this.auth
      },
      cb
    );
  };
}

module.exports = CouchbaseREST;
