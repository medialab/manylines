var struct = require('../../lib/struct.js'),
    utils = require('../../lib/utils.js'),
    models = {
      graphMeta: require('../models/graphMeta.js'),
      graph: require('../models/graph.js'),
      space: require('../models/space.js')
    };

exports.create = function(data, callback) {
  if (!struct.check(
    {
      password: 'string',
      email: 'string'
    },
    data
  ))
    throw 'exports.space.create: Wrong data.';

  models.graph.set({}, function(err, graphResult) {
    if (err)
      return callback(err);

    models.graphMeta.set({}, function(err, graphMetaResult) {
      if (err)
        return callback(err);

      models.space.set({
        password: data.password,
        email: data.email,
        graphs: [
          {
            id: graphResult.key,
            metaId: graphMetaResult.key
          }
        ]
      }, callback);
    });
  });
};

exports.delete = function(id, callback) {
  if (!struct.check(
    'string',
    id
  ))
    throw 'exports.space.delete: Wrong data.';

  var data,
      calls = 0,
      handler = function(err, result) {
        if (err)
          callback(err);

        if (--calls === 0)
          models.space.remove(id, callback);
      };

  models.space.get(id, function(err, data) {
    if (err)
      return callback(err);

    data.graphs.map(function(obj) {
      calls += 2;
      models.graph.remove(obj.id, handler);
      models.graphMeta.remove(obj.metaId, handler);
    });
  });
};
