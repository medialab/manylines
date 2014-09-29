/**
 * TubeMyNet Embed Repository
 * ===========================
 *
 */
var entities = require('../entities.js'),
    utils = require('../../lib/utils.js'),
    async = require('async');

exports.narrativeData = function(id, callback) {
  async.waterfall([
    function getNarrative(next) {
      entities.narrative.get(id, next);
    },
    function getSpace(narrative, next) {
      entities.space.get(narrative.space, function(err, space) {
        if (err)
          return next(err);

        // Composing data
        var data = {
          narrative: narrative,
          meta: space.graphs[narrative.version].meta,
          graph: space.graphs[narrative.version].id,
          snapshots: utils.indexBy(space.graphs[narrative.version].snapshots, 'id')
        };

        next(null, data);
      });
    },
    function getGraph(data, next) {
      entities.graph.get(data.graph, function(err, graph) {
        if (err)
          return next(err);

        // Adding graph data
        data.graph = graph;
        next(null, data);
      });
    }
  ], callback);
};
