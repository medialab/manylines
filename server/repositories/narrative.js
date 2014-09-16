/**
 * TubeMyNet Narrative Repository
 * ===============================
 *
 */
var async = require('async'),
    models = require('../models'),
    utils = require('../../lib/utils.js');

exports.create = function(spaceId, version, data, callback) {

  async.waterfall([
    function narrativeCreation(next) {
      models.narrative.create(
        utils.extend(data, {space: spaceId, version: version}),
        next
      );
    },
    function spaceIndexation(narrative, next) {
      models.space.get(spaceId, function(err, space) {
        err && (next(err));

        // Adding the narrative to the graph version
        space.graphs[version].narratives =
          space.graphs[version].narratives || [];

        space.graphs[version].narratives.push(narrative.id);

        // Updating
        models.space.set(spaceId, space, function(err, result) {
          next(err, narrative.id);
        });
      });
    }
  ], callback);
};

exports.retrieve = function(spaceId, version, callback) {

  async.waterfall([
    function getSpace(next) {
      models.space.get(spaceId, next);
    },
    function getNarratives(space, next) {
      models.narrative.get(space.graphs[version].narratives, {id: true}, next);
    }
  ], callback);
};

exports.update = function(id, data, callback) {
  models.narrative.update(id, data, callback);
};
