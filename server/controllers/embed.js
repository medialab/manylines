var struct = require('../../lib/struct.js'),
    utils = require('../../lib/utils.js'),
    models = {
      graphMeta: require('../models/graphMeta.js'),
      graph: require('../models/graph.js'),
      embed: require('../models/embed.js'),
      space: require('../models/space.js')
    };




/**
 * get:
 * ****
 * This route will return an embed object.
 *
 * Params:
 *   - id: string
 *       The graph ID.
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

  // Embeds are all public, no need to check authorization (session):

  models.embed.get(params.id, function(err, result) {
    if (err) {
      console.log('controllers.embed.get: unknown error retrieving the embed object.');
      console.log('  -> Message: ' + err.message);
      return res.send(500);
    }

    return res.json(result);
  });
};
