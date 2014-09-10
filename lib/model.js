/**
 * TubeMyNet Model Abstraction
 * ============================
 *
 */
var struct = require('./struct.js'),
    utils = require('./utils.js');

// Utilities
function explain(couchbaseError) {
  if (couchbaseError.code === 13)
    return {code: couchbaseError.code, reason: 'not-found'};
  else
    return {code: couchbaseError.code, reason: 'unknown'};
}

// Main class
function Model(name, bucket, schema) {
  var self = this;

  // Properties
  this.name = name;
  this.bucket = bucket;
  this.schema = schema;

  // Validate schema
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

  // Create or Update
  this.set = function(data, id, callback) {
    if (arguments.length === 2) {
      callback = id;
      id = undefined;
    }

    if (!this.check(data))
      return callback(new Error('models.' + this.name + '.set: Wrong data.'));

    id = id || utils.uuid();

    // Overloading
    data.type = this.name;
    data.created = Date.now();

    // Setting in db
    this.bucket.set(id, data, function(err, result) {
      if (err)
        return callback(explain(err), result);

      delete data.type;
      callback(null, {
        id: id,
        value: self.safe(data)
      });
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
      return callback(new Error('models.' + this.name + '.get: Wrong parameters.'));

    // Getting in db
    if (id instanceof Array)
      this.bucket.getMulti(id, {}, function(err, results) {
        if (err)
          return callback(explain(err), results);

        var items = [],
            i;

        for (i in results) {
          if (params.id)
            items.push(self.safe(results[i].value, i));
          else
            items.push(self.safe(results[i].value));
        }

        callback(null, items);
      });
    else
      this.bucket.get(id, function(err, result) {
        if (err)
          return callback(explain(err), result);

        callback(null, params.id ? self.safe(result.value, id) : self.safe(result.value));
      });
  };

  // Delete
  this.remove = function(id, callback) {
    if (!struct.check('string', id))
      return callback(new Error('models.' + this.name + '.remove: Wrong parameters.'));

    this.bucket.remove(id, function(err, result) {
      if (err)
        return callback(explain(err), result);

      callback(null, self.safe(result.value));
    });
  };
}

module.exports = Model;
