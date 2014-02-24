var struct = require('../../lib/struct.js'),
    utils = require('../../lib/utils.js'),
    models = {
      graphMeta: require('../models/graphMeta.js'),
      graph: require('../models/graph.js'),
      space: require('../models/space.js')
    };

exports.get = function(req, res) {
  var data = {
    id: req.params.password
  };

  // Check data:
  if (!struct.check(
    {
      password: 'string',
      email: 'string'
    },
    data
  ))
    return res.send(400);

  models.space.get(data.id, function(err, data) {
    if (err)
      return res.send(500); // TODO

    if (data.graphs.length)
      data.graphs.map(function(obj) {
        calls += 2;
        models.graph.remove(obj.id, handler);
        models.graphMeta.remove(obj.metaId, handler);

        delete req.session.graphs[obj.id];
        delete req.session.graphMetas[obj.metaId];
      });
    else
      return res.send(500); // TODO
  });
};
