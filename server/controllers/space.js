var struct = require('../../lib/struct.js'),
    utils = require('../../lib/utils.js'),
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
    if (err)
      return res.send(500); // TODO

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
        ok: true
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
      id: 'string'
    },
    params
  ))
    return res.send(400);

  models.space.get(params.id, function(err, result) {
    if (err)
      return res.send(500); // TODO

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

  models.graph.set({}, function(err, graphResult) {
    if (err)
      return res.send(500); // TODO

    models.graphMeta.set({}, function(err, graphMetaResult) {
      if (err)
        return res.send(500); // TODO

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
        if (err)
          return res.send(500); // TODO

        return res.json(spaceResult);
      });
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
      handler = function(err, result) {
        if (err)
          return res.send(500); // TODO

        if (--calls === 0)
          models.space.remove(params.id, function(err, spaceResult) {
            if (err)
              return res.send(500); // TODO

            return res.json(spaceResult);
          });
      };

  // Remove space from the session:
  delete req.session.spaces[params.id];

  models.space.get(params.id, function(err, data) {
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
      handler();
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
    if (err)
      return res.send(500, {  }); // TODO

    if (data.graphs.length) {
      var calls = 2,
          toSend = {},
          last = data.graphs[data.graphs.length - 1];

      models.graph.get(last.id, function(err, data) {
        if (err)
          return res.send(500); // TODO

        toSend.graph = data;

        if (--calls === 0)
          return res.json(toSend);
      });

      models.graphMeta.get(last.metaId, function(err, data) {
        if (err)
          return res.send(500); // TODO

        toSend.meta = data;

        if (--calls === 0)
          return res.json(toSend);
      });
    } else
      return res.send(500); // TODO
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
      meta: '?object',
      graph: '?object'
    },
    params
  ))
    return res.send(400);

  // Check authorizations:
  if (!(req.session.spaces || {})[params.id])
    return res.send(401);

  models.space.get(params.id, function(err, data) {
    if (err)
      return res.send(500); // TODO

    if (!data.graphs.length)
      return res.send(500); // TODO

    var calls = 0,
        toSend = {},
        last = data.graphs[data.graphs.length - 1];

    if (params.graph) {
      calls++;

      models.graph.set(
        params.graph,
        last.id,
        function(err, data) {
          if (err)
            return res.send(500); // TODO

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
          if (err)
            return res.send(500); // TODO

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
