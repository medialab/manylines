/**
 * TubeMyNet Snapshot Controller
 * ==============================
 *
 */
var repositories = {
  narrative: require('../repositories/narrative.js'),
  space: require('../repositories/space.js')
};

// Actions definition
module.exports = {

  /**
   * create:
   * -------
   * Create a narrative for the given space's version.
   *
   */
  create: {
    validate: {
      id: 'string',
      version: 'string',
      narrative: {
        title: 'string',
        slides: ['slide']
      }
    },
    policies: 'authenticated',
    method: function(req, res) {
      var id = req.param('id'),
          version = +req.param('version'),
          narrative = req.param('narrative');

      repositories.narrative.create(id, version, narrative, function(err, narrativeId) {
        if (err)
          return res.error(err, 400);

        res.json({id: narrativeId});
      });
    }
  },

  /**
   * get:
   * ----
   * Get a single narrative plus its graph and snapshot for embed purposes.
   *
   */
  get: {
    method: function(req, res) {
      return res.json({notYetImplemented: true});
    }
  },

  /**
   * getAll:
   * -------
   * Retrieve every narratives for a given space version.
   *
   */
  getAll: {
    validate: {
      id: 'string',
      version: 'string'
    },
    policies: 'authenticated',
    method: function(req, res) {
      var id = req.param('id'),
          version = +req.param('version');

      repositories.narrative.retrieve(id, version, function(err, narratives) {
        if (err)
          return res.error(err, 400);

        res.json(narratives);
      });
    }
  },

  /**
   * update:
   * -------
   * Update a single narrative.
   *
   */
  update: {
    validate: {
      id: 'string',
      narrative: {
        title: 'string',
        slides: ['slide']
      }
    },
    policies: 'authenticated',
    method: function(req, res) {
      var id = req.param('id'),
          narrative = req.param('narrative');

      repositories.narrative.update(id, narrative, function(err, result) {
        if (err)
          return res.error(err, 400);

        res.json({ok: true});
      });
    }
  }
};
