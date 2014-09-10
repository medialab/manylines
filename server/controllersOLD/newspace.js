var Controller = require('../../lib/controller.js'),
    models = require('../models.js');

// Actions definitions
var actions = {

  /**
   * login:
   * ******
   * This route will log an user into a space and every graphs and metas
   * attached to it.
   *
   * Params:
   *   - id: <string> The space ID.
   *   - password: <string> The password of the space.
   */
  login: {
    data: {
      id: 'string',
      password: 'string'
    },
    method: function(req, res) {

      // Retrieving the desired space
      models.space.get(req.data.id, function(err, space) {
        if (err && err.reason)
          return res.error(space "' + params.id + '" not found., err.message);
      });
    }
  }
};

// Exporting
module.exports = new Controller('space', actions);

exports.login = function(req, res) {

  models.space.get(params.id, function(err, result) {
    if (err) {
      if (err.code === 13) {
        logger.error(
          'controllers.space.login: space "' + params.id + '" not found.',
          {errorMsg: err.message}
        );
      } else {
        logger.error(
          'controllers.space.login: unknown error.',
          {errorMsg: err.message}
        );
      }

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
        version: result.graphs.length
      });
    }
  });
};

