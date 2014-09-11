/**
 * TubeMyNet Space Repository
 * ===========================
 *
 */
var async = require('async'),
    models = require('../models'),
    utils = require('../../lib/utils.js'),
    struct = require('../../lib/struct.js');

exports.initialize = function(email, password, graphData, graphMeta, callback) {

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
            metas: graphMeta
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

exports.getVersion = function(id, version, callback) {

  // Retrieving space and the desired graph version
  async.waterfall([
    function space(next) {
      models.space.get(id, next);
    },
    function graph(space, next) {
      if (!space || space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      models.graph.get(space.graphs[version].id, function(err, graph) {
        next(err, {space: space, graph: graph});
      });
    }
  ], callback);
};

exports.getGraphData = function(id, version, callback) {

  // Retrieving space and then the desired graph data
  async.waterfall([
    function space(next) {
      models.space.get(id, next);
    },
    function graphData(space, next) {
      if (!space || space.graphs.length - 1 < version)
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
      if (!space || space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      models.graph.set(space.graphs[version].id, data, next);
    }
  ], callback);
};

exports.addSnasphot = function(id, version, data, callback) {
  if (!struct.check('snapshot', data))
    return callback(new Error('wrong-data'));

  // Retrieving the space and add the snapshot
  async.waterfall([
    function space(next) {
      models.space.get(id, next);
    },
    function updateGraph(space, next) {
      if (!space || space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      var snapshots = space.graphs[version].snapshots || [];
      snapshots.push(data);
      space.graphs[version].snapshots = snapshots;

      models.space.set(id, space, next);
    }
  ], callback);
};

exports.getSnapshots = function(id, version, callback) {

  // Retrieving the snapshots within the space
  models.space.get(id, function(err, space) {
    if (!space || space.graphs.length - 1 < version)
      return next(new Error('inexistant-version'));

    callback(null, space.graphs[version].snapshots || []);
  });
};
