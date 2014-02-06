var settings = require('../../config.json'),
    struct = require('../../lib/struct.js'),
    utils = require('../../lib/utils.js'),
    couchbase = require('couchbase');

exports.set = function(data, callback) {
  if (!struct.check(
    {
      password: 'string',
      email: 'string',
      graphs: '?array'
    },
    data
  ))
    throw 'models.space.set: Wrong data.';

  var id = utils.uuid(),
      data = {
        graphs: data.graphs || [],
        password: data.password,
        created: Date.now(),
        email: data.email,
      },
      db = new couchbase.Connection(
        {
          bucket: settings.buckets.space
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

              // Execute callback without error:
              callback(err, {
                key: id,
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
    throw 'models.space.get: Wrong data.';

  var db = new couchbase.Connection(
    {
      bucket: settings.buckets.space
    },
    function(err) {
      if (err)
        return callback(err);

      db.get(
        id,
        function(err, result) {
          if (err)
            return callback(err, result);

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
    throw 'models.space.remove: Wrong data.';

  var db = new couchbase.Connection(
    {
      bucket: settings.buckets.space
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
