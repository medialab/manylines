var settings = require('../../config.json'),
    struct = require('../../lib/struct.js'),
    utils = require('../../lib/utils.js'),
    bucket = require('../buckets.js').buckets.graph;

exports.set = function(data, id, callback) {
  if (!struct.check(
    {
      nodes: '?array',
      edges: '?array'
    },
    data
  ))
    return callback(new Error('models.graph.set: Wrong data.'));

  if (arguments.length === 2) {
    callback = id;
    id = false;
  }

  var id = id || utils.uuid();

  data.tbnType = 'graph';

  bucket.set(
    id,
    data,
    function(err, result) {
      if (err)
        return callback(err, result);

      // Remove the "tbnType" value:
      delete data.tbnType;

      // Execute callback without error:
      callback(err, {
        id: id,
        value: data
      });
    }
  );

};

exports.get = function(id, callback) {
  if (!struct.check(
    'string',
    id
  ))
    return callback(new Error('models.graph.get: Wrong data.'));

  bucket.get(
    id,
    function(err, result) {
      if (err)
        return callback(err, result);

      // Remove the "tbnType" value:
      delete result.value.tbnType;

      // Execute callback without error:
      callback(err, result.value);
    }
  );
};

exports.remove = function(id, callback) {
  if (!struct.check(
    'string',
    id
  ))
    return callback(new Error('models.graph.remove: Wrong data.'));

  bucket.remove(
    id,
    function(err, result) {
      if (err)
        return callback(err, result);

      // Execute callback without error:
      callback(err, result);
    }
  );
};
