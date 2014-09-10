var async = require('async'),
    struct = require('../../lib/struct.js'),
    utils = require('../../lib/utils.js'),
    logger = require('../../lib/log.js').api.logger,
    models = require('../models.js');




/**
 * add:
 * ****
 * This route will add a narrative to the given graph.
 *
 * Params:
 *   - id: string
 *       The space ID.
 *   - version: integer
 *       The version of the graph to export.
 *   - narrative: ?object
 *       An object describing the narrative to create.
 *
 * Todos: check that the slides views do exist
 */
exports.add = function(req, res) {
  var params = {
    id: req.params.id,
    narrative: req.body.narrative,
    version: +req.params.version
  };

  // Check params:
  if (!struct.check(
    {
      id: 'string',
      narrative: {
        slides: 'array',
        title: 'string'
      },
      version: 'integer'
    },
    params
  ))
    return res.send(400);

  // Check authorizations:
  if (!(req.session.spaces || {})[params.id])
    return res.send(401);

  // Retrieving the relevant space
  models.space.get(params.id, function(err, spaceResult) {

    // Dealing with errors
    if (err) {
      if (err.code === 13) {
        logger.error(
          'controllers.narrative.add: space "' + params.id + '" not found.',
          {errorMsg: err.message}
        );
        return res.send(401);
      } else {
        logger.error(
          'controllers.narrative.add: unknown error.',
          {errorMsg: err.message}
        );
      }
      return res.send(500);
    }

    // The space is graphless
    if (!spaceResult.graphs.length) {
      logger.error(
        'controllers.narrative.add: space "' + params.id + '" has no graph stored.');
      return res.send(500);
    }

    // The version given is irrelevant
    if ((params.version > spaceResult.graphs.length - 1) || (params.version < 0)) {
      logger.error(
        'controllers.narrative.add: wrong version number: ' + params.version + ' (last version: ' + (spaceResult.graphs.length + 1) + ').');
      return res.send(400);
    }

    // We proceed to set the narrative
    async.waterfall([
      function setNarrative(next) {
        models.narrative.set(params.narrative, function(err, narrativeResult) {
          if (err) {
            logger.error(
              'controllers.narrative.add: unknown error setting the narrative object.',
              {errorMsg: err.message}
            );

            return res.send(500);
          }

          next(null, narrativeResult);
        });
      },
      function updateSpace(narrativeResult, next) {
        var graphVersion = spaceResult.graphs[params.version];
        graphVersion.narratives = graphVersion.narratives || [];
        graphVersion.narratives.push({
          id: narrativeResult.id
        });

        models.space.set(spaceResult, params.id, function(err) {
          if (err) {
            logger.error(
              'controllers.narrative.add: unknown error updating the narrative object.',
              {errorMsg: err.message}
            );

            return res.send(500);
          }

          next(null, narrativeResult.id);
        });
      }
    ], function(err, id) {
      if (err)
        return res.send(500);

      return res.json({id: id});
    });
  });
}
