/**
 * TubeMyNet Model Abstraction
 * ============================
 *
 * Models aim at providing a high-level interface to Couchbase data so the
 * API and its repository can find what they need efficiently.
 *
 */
var struct = require('./struct.js'),
    utils = require('./utils.js');

// Main class
function Model(name, bucket, schema) {
  var self = this;

  // Properties
  this.name = name;
  this.bucket = bucket;
  this.schema = schema;

  // Validate against model's schema
  this.check = function(data) {
    return struct.check(this.schema, data);
  };

  // Return a version of the object fit for client
  this.safe = function(o, id) {
    var so = {},
        o = o || {},
        i;

    if (typeof this.schema !== 'object') {
      for (i in o)  {
        if (i !== 'type')
          so[i] = o[i];
      }
    }
    else {
      for (i in this.schema) {
        if (i in o)
          so[i] = o[i];
      }
    }

    // Do we need to add the id?
    if (id)
      so.id = id;

    return so;
  };

  // Create an item
  this.create = function(data, callback) {
    if (!this.check(data))
      return callback({reason: 'wrong-data'});

    var id = utils.uuid();

    var toSet = utils.extend(
      {type: this.name},
      data
    );

    // Persisting
    this.bucket.set(id, toSet, function(err, result) {
      if (err)
        return callback(err);

      callback(null, self.safe(data, id));
    });
  };

  // Update an item
  this.update = function(id, data, callback) {

    // Fetching data
    this.get(id, function(err, result) {
      if (err)
        return callback(err);
      if (!result)
        return callback({reason: 'not-found'});

      // Updating
      var newData = utils.extend(data, result);
      self.set(id, newData, callback);
    });
  };

  // Overwrite an item
  this.set = function(id, data, callback) {
    if (!this.check(data))
      return callback({reason: 'wrong-data'});

    var toSet = utils.extend(
      {type: this.name},
      data
    );

    // Persisting
    this.bucket.set(id, toSet, function(err, result) {
      if (err)
        return callback(err);

      callback(null, self.safe(data, id));
    });
  };

  // Get
  this.get = function(id, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = {};
    }
    else {
      params = params || {};
    }

    if (!struct.check('string|array', id))
      return callback({reason: 'wrong-parameters'});

    // Getting in db
    if (id instanceof Array)
      this.bucket.getMulti(id, {}, function(err, results) {
        if (err)
          return callback(err, results);

        var items = [];

        id.forEach(function(i) {
          if (params.id)
            items.push(self.safe(results[i].value, i));
          else
            items.push(self.safe(results[i].value));
        });

        callback(null, items);
      });
    else
      this.bucket.get(id, function(err, result) {
        if (err && err.code === 13)
          return callback(null, null);
        else if (err)
          return callback(err, result);

        callback(null, params.id ? self.safe(result.value, id) : self.safe(result.value));
      });
  };

  // Delete
  this.remove = function(id, callback) {
    this.bucket.remove(id, function(err, result) {
      if (err)
        return callback(err);

      callback(null);
    });
  };
}

module.exports = Model;
