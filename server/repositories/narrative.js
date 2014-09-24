/**
 * TubeMyNet Narrative Repository
 * ===============================
 *
 */
var async = require('async'),
    entities = require('../entities.js'),
    utils = require('../../lib/utils.js');

exports.create = function(spaceId, version, data, callback) {

  async.waterfall([
    function narrativeCreation(next) {
      entities.narrative.create(
        utils.extend(data, {space: spaceId, version: version}),
        next
      );
    },
    function spaceIndexation(narrative, next) {
      entities.space.get(spaceId, function(err, space) {
        err && (next(err));

        // Adding the narrative to the graph version
        space.graphs[version].narratives =
          space.graphs[version].narratives || [];

        space.graphs[version].narratives.push(narrative.id);

        // Updating
        entities.space.set(spaceId, space, function(err, result) {
          next(err, narrative.id);
        });
      });
    }
  ], callback);
};

exports.retrieve = function(spaceId, version, callback) {

  async.waterfall([
    function getSpace(next) {
      entities.space.get(spaceId, next);
    },
    function getNarratives(space, next) {

      if ((space.graphs[version].narratives || []).length)
        entities.narrative.get(
          space.graphs[version].narratives,
          {id: true},
          next
        );
      else
        next(null, []);
    }
  ], callback);
};

exports.update = function(id, data, callback) {
  entities.narrative.update(id, data, callback);
};
