/**
 * TubeMyNet Graph Controller
 * ===========================
 *
 */
var repositories = {
  space: require('../repositories/space.js')
};

// Actions definition
module.exports = {

  /**
   * get:
   * ----
   * Retrieve graph data corresponding to a space id and a version.
   *
   */
  get: {
    validate: {
      id: 'string',
      version: 'string'
    },
    policies: 'authenticated',
    method: function(req, res) {
      var id = req.param('id'),
          version = +req.param('version');

      repositories.space.getGraphData(id, version, function(err, graph) {
        if (err)
          return res.error(err, 404);

        res.json(graph);
      });
    }
  }
};
