var struct = require('../../lib/struct.js'),
    utils = require('../../lib/utils.js'),
    errors = require('../../errors.json'),
    validator = require('validator'),
    models = {
      graphMeta: require('../models/graphMeta.js'),
      graph: require('../models/graph.js'),
      space: require('../models/space.js')
    };

/**
 * [login description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.login = function(req, res) {
  var params = {
    password: req.params.password,
    id: req.params.id
  };

  // Check params:
  if (!struct.check(
    {
      password: 'string',
      id: 'string'
    },
    params
  ))
    return res.send(400);

  models.space.get(params.id, function(err, result) {
    if (err) {
      if (err.code === 13)
        console.log('controllers.space.login: space "' + params.id + '" not found.');
      else
        console.log('controllers.space.login: unknown error.');

      return res.send(401);
    }

    if (result.password !== utils.encrypt(params.password))
      return res.send(401);
    else {
      var date = Date.now();

      // Add space, graphs metas and graphs to the session:
      req.session.spaces = req.session.spaces || {};
      req.session.graphs = req.session.graphs || {};
      req.session.graphMetas = req.session.graphMetas || {};

      req.session.spaces[params.id] = date;
      result.graphs.forEach(function(obj) {
        req.session.graphs[obj.id] = date;
        req.session.graphMetas[obj.metaId] = date;
      });

      // Send response:
      return res.json({
        id: params.id,
        email: result.email,
        graphs: result.graphs
      });
    }
  });
};

/**
 * [logout description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.logout = function(req, res) {
  var params = {
    id: req.params.id
  };

  // Check params:
  if (!struct.check(
    {
      id: '?string'
    },
    params
  ))
    return res.send(400);

  if (typeof params.id === 'string')
    models.space.get(params.id, function(err, result) {
      if (err) {
        if (err.code === 13)
          console.log('controllers.space.logout: space "' + params.id + '" not found.');
        else
          console.log('controllers.space.logout: unknown error.');

        return res.json({
          ok: true
        });
      }

      // Remove space, graphs metas and graphs from the session:
      delete (req.session.spaces || {})[params.id];
      result.graphs.forEach(function(obj) {
        delete (req.session.graphs || {})[obj.id];
        delete (req.session.graphMetas || {})[obj.metaId];
      });

      // Send response:
      return res.json({
        ok: true
      });
    });
  else {
    delete req.session.spaces;
    delete req.session.graphs;
    delete req.session.graphMetas;

    return res.json({
      ok: true
    });
  }
};

/**
 * [create description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.create = function(req, res) {
  var params = {
    password: req.params.password,
    email: req.params.email
  };

  // Check params:
  if (!struct.check(
    {
      password: 'string',
      email: 'string'
    },
    params
  ))
    return res.send(400);

  if (!validator.isEmail(params.email))
    return res.send(400, errors.INPUT_INVALID_EMAIL);

  if (!validator.isLength(params.password, 8))
    return res.send(400, errors.INPUT_INVALID_PASSWORD);

  models.graph.set({}, function(err, graphResult) {
    if (err) {
      console.log('controllers.space.create: unknown error creating the graph object.');
      return res.send(500);
    }

    models.graphMeta.set({}, function(err, graphMetaResult) {
      if (err) {
        console.log('controllers.space.create: unknown error creating the graph meta object.');
        return res.send(500);
      }

      models.space.set({
        password: utils.encrypt(params.password),
        email: params.email,
        graphs: [
          {
            id: graphResult.id,
            metaId: graphMetaResult.id
          }
        ]
      }, function(err, spaceResult) {
        if (err) {
          console.log('controllers.space.create: unknown error creating the space object.');
          return res.send(500);
        }

        var date = Date.now();

        // Add space, graphs metas and graphs to the session:
        req.session.spaces = req.session.spaces || {};
        req.session.graphs = req.session.graphs || {};
        req.session.graphMetas = req.session.graphMetas || {};

        req.session.spaces[spaceResult.id] = date;
        req.session.graphs[spaceResult.value.graphs[0].id] = date;
        req.session.graphMetas[spaceResult.value.graphs[0].metaId] = date;

        return res.json({
          id: spaceResult.id,
          email: spaceResult.value.email,
          graphs: spaceResult.value.graphs
        });
      });
    });
  });
};

/**
 * [get description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.get = function(req, res) {
  var params = {
    id: req.params.id
  };

  // Check params:
  if (!struct.check(
    {
      id: 'string'
    },
    params
  ))
    return res.send(400);

  // Check authorizations:
  if (!(req.session.spaces || {})[params.id])
    return res.send(401);

  models.space.get(params.id, function(err, result) {
    if (err) {
      console.log('controllers.space.get: unknown error retrieving the graph object.');
      return res.send(500);
    }

    return res.json({
      id: req.params.id,
      email: result.email,
      graphs: result.graphs
    });
  });
};

/**
 * [delete description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.delete = function(req, res) {
  var params = {
    id: req.params.id
  };

  // Check params:
  if (!struct.check(
    {
      id: 'string'
    },
    params
  ))
    return res.send(400);

  // Check authorizations:
  if (!(req.session.spaces || {})[params.id])
    return res.send(401);

  var calls = 0,
      handlerFactory = function(service, id) {
        return function(err, result) {
          if (err) {
            if (err.code === 13) {
              console.log('controllers.space.delete: ' + service + ' "' + id + '" not found.');
              return res.send(401);
            } else
              console.log('controllers.space.delete: unknown error deleting the ' + service + ' object "' + id + '".');

            return res.send(500);
          }
          if (err) {
            console.log('controllers.space.delete: unknown error deleting the ' + service + ' object "' + id + '".');
            return res.send(500);
          }

          if (--calls === 0)
            models.space.remove(params.id, function(err, spaceResult) {
              if (err) {
                console.log('controllers.space.delete: unknown error deleting the space object "' + params.id + '".');
                return res.send(500);
              }

              return res.json(spaceResult);
            });
        }
      };

  // Remove space from the session:
  delete req.session.spaces[params.id];

  models.space.get(params.id, function(err, data) {
    if (err) {
      if (err.code === 13) {
        console.log('controllers.space.delete: space "' + params.id + '" not found.');
        return res.send(401);
      } else
        console.log('controllers.space.delete: unknown error getting the space object "' + params.id + '".');

      return res.send(500);
    }

    if (data.graphs.length)
      data.graphs.map(function(obj) {
        calls += 2;
        models.graph.remove(obj.id, handlerFactory('graph', obj.id));
        models.graphMeta.remove(obj.metaId, handlerFactory('graph meta',obj.metaId));

        delete req.session.graphs[obj.id];
        delete req.session.graphMetas[obj.metaId];
      });
    else
      // Nothing is wrong
      handlerFactory()();
  });
};

/**
 * [readLast description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.readLast = function(req, res) {
  var params = {
    id: req.params.id
  };

  // Check params:
  if (!struct.check(
    {
      id: 'string'
    },
    params
  ))
    return res.send(400);

  // Check authorizations:
  if (!(req.session.spaces || {})[params.id])
    return res.send(401);

  models.space.get(params.id, function(err, data) {
    if (err) {
      if (err.code === 13) {
        console.log('controllers.space.readLast: space "' + params.id + '" not found.');
        return res.send(401);
      } else
        console.log('controllers.space.readLast: unknown error.');

      return res.send(500);
    }

    if (data.graphs.length) {
      var calls = 2,
          toSend = {},
          last = data.graphs[data.graphs.length - 1];

      models.graph.get(last.id, function(err, data) {
        if (err) {
          if (err.code === 13) {
            console.log('controllers.space.readLast: graph "' + last.id + '" not found.');
            return res.send(401);
          } else
            console.log('controllers.space.readLast: unknown error getting graph "' + last.id + '".');

          return res.send(500);
        }

        toSend.graph = data;

        if (--calls === 0)
          return res.json(toSend);
      });

      models.graphMeta.get(last.metaId, function(err, data) {
        if (err) {
          if (err.code === 13) {
            console.log('controllers.space.readLast: graph meta "' + last.metaId + '" not found.');
            return res.send(401);
          } else
            console.log('controllers.space.readLast: unknown error getting graph meta "' + last.metaId + '".');

          return res.send(500);
        }

        toSend.meta = data;

        if (--calls === 0)
          return res.json(toSend);
      });
    } else {
      console.log('controllers.space.readLast: space "' + params.id + '" has no graph.');
      return res.send(500);
    }
  });
};

/**
 * [updateLast description]
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.updateLast = function(req, res) {
  var params = {
    id: req.params.id,
    meta: req.body.meta,
    graph: req.body.graph
  };

  // Check params:
  if (!struct.check(
    {
      id: 'string',
      graphMeta: '?object',
      graph: '?object'
    },
    params
  ))
    return res.send(400);

  // Check authorizations:
  if (!(req.session.spaces || {})[params.id])
    return res.send(401);

  models.space.get(params.id, function(err, data) {
    if (err) {
      if (err.code === 13) {
        console.log('controllers.space.updateLast: space "' + params.id + '" not found.');
        return res.send(401);
      } else
        console.log('controllers.space.updateLast: unknown error.');

      return res.send(500);
    }

    if (!data.graphs.length) {
      console.log('controllers.space.updateLast: space "' + params.id + '" has no graph stored.');
      return res.send(500);
    }

    var calls = 0,
        toSend = {},
        last = data.graphs[data.graphs.length - 1];

    if (params.graph) {
      calls++;

      models.graph.set(
        params.graph,
        last.id,
        function(err, data) {
          if (err) {
            console.log('controllers.space.updateLast: unknown error creating the graph object.');
            return res.send(500);
          }

          toSend.graph = data.value;

          if (--calls === 0)
            return res.json(toSend);
        }
      );
    }

    if (params.meta) {
      calls++;

      models.graphMeta.set(
        params.meta,
        last.metaId,
        function(err, data) {
          if (err) {
            console.log('controllers.space.updateLast: unknown error creating the graph meta object.');
            return res.send(500);
          }

          toSend.meta = data.value;

          if (--calls === 0)
            return res.json(toSend);
        }
      );
    }

    if (!calls)
      return res.send(400);
  });
};
