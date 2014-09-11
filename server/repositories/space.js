/**
 * TubeMyNet Space Repository
 * ===========================
 *
 */
var async = require('async'),
    models = require('../models'),
    utils = require('../../lib/utils.js');

exports.initialize = function(email, password, graphData, graphMetas, callback) {

  // Creating the needed items
  async.waterfall([
    function graph(next) {
      models.graph.create(graphData, next);
    },
    function space(graph, next) {
      var data = {
        email: email,
        password: utils.encrypt(password),
        graphs: [
          {
            id: graph.id,
            metas: graphMetas
          }
        ]
      };

      models.space.create(data, next);
    }
  ], callback);
};

exports.update = function(id, email, password, callback) {
  var updateData = {};

  email && (updateData.email = email);
  password && (updateData.password = password);

  models.space.update(id, updateData, callback);
};

exports.getGraphData = function(id, version, callback) {

  // Retrieving space and then the desired graph data
  async.waterfall([
    function space(next) {
      models.space.get(id, next);
    },
    function graphData(space, next) {
      if (space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      models.graph.get(space.graphs[version].id, next);
    }
  ], callback);
};

exports.updateGraphData = function(id, version, data, callback) {

  // Retrieving space and update said version
  async.waterfall([
    function space(next) {
      models.space.get(id, next);
    },
    function updateGraph(space, next) {
      if (space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      models.graph.set(space.graphs[version].id, data, next);
    }
  ], callback);
};
