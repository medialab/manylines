/**
 * TubeMyNet Space Repository
 * ===========================
 *
 */
var _ = require('lodash'),
    async = require('async'),
    entities = require('../entities.js'),
    utils = require('../../lib/utils.js'),
    types = require('typology');

exports.initialize = function(email, password, graphData, graphMeta, callback) {

  // Creating the needed items
  async.waterfall([
    function graph(next) {
      entities.graph.create(graphData, next);
    },
    function space(graph, next) {
      var data = {
        email: email,
        password: utils.encrypt(password),
        graphs: [
          {
            id: graph.id,
            meta: graphMeta,
            snapshots: [],
            narratives: []
          }
        ]
      };

      entities.space.create(data, next);
    }
  ], callback);
};

exports.bump = function(id, graphData, graphMeta, callback) {

  // Creating graph
  async.waterfall([
    function graph(next) {
      entities.graph.create(graphData, next);
    },
    function updateSpace(graph, next) {
      entities.space.get(id, function(err, space) {
        if (err)
          return next(err);

        space.graphs.push({
          id: graph.id,
          meta: graphMeta,
          snapshots: [],
          narratives: []
        });

        // Updating space with new information
        entities.space.set(id, space, next);
      });
    }
  ], callback);
};

exports.update = function(id, email, password, callback) {
  var updateData = {};

  email && (updateData.email = email);
  password && (updateData.password = password);

  entities.space.update(id, updateData, callback);
};

exports.getVersion = function(id, version, callback) {

  // Retrieving space and the desired graph version
  async.waterfall([
    function space(next) {
      entities.space.get(id, next);
    },
    function graph(space, next) {
      if (!space || space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      entities.graph.get(space.graphs[version].id, function(err, graph) {
        next(err, {
          space: space,
          graph: graph,
          meta: space.graphs[version].meta,
          snapshots: space.graphs[version].snapshots || []
        });
      });
    }
  ], callback);
};

exports.getGraphData = function(id, version, callback) {

  // Retrieving space and then the desired graph data
  async.waterfall([
    function space(next) {
      entities.space.get(id, next);
    },
    function graphData(space, next) {
      if (!space || space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      entities.graph.get(space.graphs[version].id, next);
    }
  ], callback);
};

exports.updateGraphData = function(id, version, data, callback) {

  // Retrieving space and update said version
  async.waterfall([
    function space(next) {
      entities.space.get(id, next);
    },
    function updateGraph(space, next) {
      if (!space || space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      entities.graph.set(space.graphs[version].id, data, next);
    }
  ], callback);
};

exports.updateGraphMeta = function(id, version, data, callback) {

  // Retrieving space and update said version
  async.waterfall([
    function space(next) {
      entities.space.get(id, next);
    },
    function updateMeta(space, next) {
      if (!space || space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      space.graphs[version].meta = data;

      entities.space.set(id, space, next);
    }
  ], callback);
};

exports.addSnapshot = function(id, version, data, callback) {

  // Checking the snapshot is valid
  if (!types.check(data, 'snapshot'))
    return callback(new Error('wrong-data'));

  // Adding a unique identifier to the snapshot
  data.id = utils.uuid();

  // Retrieving the space and add the snapshot
  async.waterfall([
    function space(next) {
      entities.space.get(id, next);
    },
    function updateGraph(space, next) {
      if (!space || space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      var snapshots = space.graphs[version].snapshots || [];
      snapshots.push(data);
      space.graphs[version].snapshots = snapshots;

      entities.space.set(id, space, function(err, result) {
        next(err, data.id);
      });
    }
  ], callback);
};

exports.getSnapshots = function(id, version, callback) {

  // Retrieving the snapshots within the space
  entities.space.get(id, function(err, space) {
    if (!space || space.graphs.length - 1 < version)
      return callback(new Error('inexistant-version'));

    callback(null, space.graphs[version].snapshots || []);
  });
};

exports.removeSnapshot = function(id, version, snapshotId, callback) {

  async.waterfall([
    function getSpace(next) {
      entities.space.get(id, next);
    },
    function updateSpace(space, next) {
      if (!space || space.graphs.length - 1 < version)
        return next(new Error('inexistant-version'));

      var index = _.findIndex(space.graphs[version].snapshots, function(snapshot) {
        return snapshot.id === snapshotId;
      });

      if (!~index)
        return next(new Error('inexistant-snapshot'));

      // Splicing
      space.graphs[version].snapshots.splice(index, 1);

      // Updating
      entities.space.set(id, space, next);
    }
  ], callback);
};
