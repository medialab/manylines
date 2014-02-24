var settings = require('../../config.json'),
    struct = require('../../lib/struct.js'),
    utils = require('../../lib/utils.js'),
    couchbase = require('couchbase');

exports.set = function(data, id, callback) {
  if (!struct.check(
    'object',
    data
  ))
    callback(new Error('models.graphMeta.set: Wrong data.'));

  if (arguments.length === 2) {
    callback = id;
    id = false;
  }

  var id = id || utils.uuid(),
      db = new couchbase.Connection(
        {
          bucket: settings.buckets.graphMeta
        },
        function(err) {
          if (err)
            return callback(err);

          db.set(
            id,
            data,
            function(err, result) {
              if (err)
                return callback(err, result);

              data.tbnValue = 'graphMeta';

              // Execute callback without error:
              callback(err, {
                id: id,
                value: data
              });
            }
          );
        }
      );
};

exports.get = function(id, callback) {
  if (!struct.check(
    'string',
    id
  ))
    callback(new Error('models.graphMeta.get: Wrong data.'));

  var db = new couchbase.Connection(
    {
      bucket: settings.buckets.graphMeta
    },
    function(err) {
      if (err)
        return callback(err);

      db.get(
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
    }
  );
};

exports.remove = function(id, callback) {
  if (!struct.check(
    'string',
    id
  ))
    callback(new Error('models.graphMeta.remove: Wrong data.'));

  var db = new couchbase.Connection(
    {
      bucket: settings.buckets.graphMeta
    },
    function(err) {
      if (err)
        return callback(err);

      db.remove(
        id,
        function(err, result) {
          if (err)
            return callback(err, result);

          // Execute callback without error:
          callback(err, result);
        }
      );
    }
  );
};
