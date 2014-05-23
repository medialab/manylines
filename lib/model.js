/**
 * TubeMyNet Model Abstraction
 * ============================
 *
 */
var struct = require('./struct.js'),
    utils = require('./utils.js');

function Model(name, bucket, schema) {
  var _this = this;

  // Properties
  this.name = name;
  this.bucket = bucket;
  this.schema = schema;

  // Validate schema
  this.check = function(data) {
    return struct.check(this.schema, data);
  };

  // Return a version of the object fit for client
  this.safe = function(o) {
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
        return callback(err, result);

      delete data.type;
      callback(err, {
        id: id,
        value: _this.safe(data)
      });
    });
  };

  // Get
  this.get = function(id, callback) {
    if (!struct.check('string', id))
      return callback(new Error('models.' + this.name + '.get: Wrong data.'));

    // Getting in db
    this.bucket.get(id, function(err, result) {
      if (err)
        return callback(err, result);

      callback(err, _this.safe(result.value));
    });
  };

  // Delete
  this.remove = function(id, callback) {
    if (!struct.check('string', id))
      return callback(new Error('models.' + this.name + '.remove: Wrong data.'));

    this.bucket.remove(id, function(err, result) {
      if (err)
        return callback(err, result);

      callback(err, _this.safe(result.value));
    });
  };
}

module.exports = Model;
