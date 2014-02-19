var struct = require('../../lib/struct.js'),
    utils = require('../../lib/utils.js'),
    models = {
      graphMeta: require('../models/graphMeta.js'),
      graph: require('../models/graph.js'),
      space: require('../models/space.js')
    };

exports.login = function(req, res) {
  var data = {
    password: req.params.password,
    id: req.params.id
  };

  if (!struct.check(
    {
      password: 'string',
      id: 'string'
    },
    data
  ))
    return res.send(400);

  models.space.get(data.id, function(err, result) {
    if (err)
      return res.send(500); // TODO

    if (result.password !== utils.encrypt(data.password))
      return res.send(401);
    else {
      var date = Date.now();

      // Add space, graphs metas and graphs to the session:
      req.session.spaces = req.session.spaces || {};
      req.session.graphs = req.session.graphs || {};
      req.session.graphMetas = req.session.graphMetas || {};

      req.session.space[data.id] = date;
      result.graphs.forEach(function(obj) {
        req.session.graphs[obj.id] = date;
        req.session.graphMetas[obj.metaId] = date;
      });

      // Send response:
      return res.send(JSON.stringify({
        ok: true
      }));
    }
  });
};

exports.logout = function(req, res) {
  var data = {
    id: req.params.id
  };

  if (!struct.check(
    {
      id: 'string'
    },
    data
  ))
    return res.send(400);

  models.space.get(data.id, function(err, result) {
    if (err)
      return res.send(500); // TODO

    // Remove space, graphs metas and graphs from the session:
    delete req.session.space[data.id];
    result.graphs.forEach(function(obj) {
      delete req.session.graphs[obj.id];
      delete req.session.graphMetas[obj.metaId];
    });

    // Send response:
    return res.send(JSON.stringify({
      ok: true
    }));
  });
};

exports.create = function(req, res) {
  var data = {
    password: req.params.password,
    email: req.params.email
  };

  if (!struct.check(
    {
      password: 'string',
      email: 'string'
    },
    data
  ))
    return res.send(400);

  models.graph.set({}, function(err, graphResult) {
    if (err)
      return res.send(500); // TODO

    models.graphMeta.set({}, function(err, graphMetaResult) {
      if (err)
        return res.send(500); // TODO

      models.space.set({
        password: utils.encrypt(data.password),
        email: data.email,
        graphs: [
          {
            id: graphResult.id,
            metaId: graphMetaResult.id
          }
        ]
      }, function(err, spaceResult) {
        if (err)
          return res.send(500); // TODO

        return res.send(JSON.stringify(spaceResult));
      });
    });
  });
};

exports.delete = function(req, res) {
  var data = {
    id: req.params.id
  };

  if (!struct.check(
    {
      id: 'string'
    },
    data
  ))
    return res.send(400);

  var data,
      calls = 0,
      handler = function(err, result) {
        if (err)
          return res.send(500); // TODO

        if (--calls === 0)
          models.space.remove(data.id, function(err, spaceResult) {
            if (err)
              return res.send(500); // TODO

            return res.send(JSON.stringify(spaceResult));
          });
      };

  models.space.get(data.id, function(err, data) {
    if (err)
      return res.send(500); // TODO

    if (data.graphs.length)
      data.graphs.map(function(obj) {
        calls += 2;
        models.graph.remove(obj.id, handler);
        models.graphMeta.remove(obj.metaId, handler);
      });
    else
      handler();
  });
};
