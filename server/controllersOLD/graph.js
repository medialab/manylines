var Controller = require('../../lib/controller.js'),
    models = require('../models.js');

// Action definitions
var actions = {

  /**
   * get:
   * ****
   * This action will return the graph corresponding to a precise id.
   *
   * Params:
   *   - id: <string> The graph ID.
   */
  get: {
    data: {
      id: 'string'
    },
    policies: 'authorized',
    method: function(data, res) {

      // Retrieving the graph
      models.graph.get(data.id, function(err, result) {
        if (err)
          return res.error('unknown error retrieving the graph object.', err);

        return res.json(result);
      });
    }
  }
};

// Exporting
module.exports = new Controller('graph', actions);
