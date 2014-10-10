/**
 * Manylines Snapshot Controller
 * ==============================
 *
 */
var repositories = {
  space: require('../repositories/space.js')
};

// Actions definition
module.exports = {

  /**
   * add:
   * ----
   * Add a snapshot to the corresponding space and graph.
   *
   */
  add: {
    validate: {
      id: 'string',
      version: 'string',
      snapshot: 'snapshot'
    },
    policies: 'authenticated',
    method: function(req, res) {
      var id = req.param('id'),
          version = +req.param('version'),
          snapshot = req.param('snapshot');

      repositories.space.addSnapshot(id, version, snapshot, function(err, snapshotId) {
        if (err)
          return res.error(err, 400);

        res.json({id: snapshotId});
      });
    }
  },

  /**
   * get:
   * ----
   * Retrieve snapshots corresponding to a space id and a graph version.
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

      repositories.space.getSnapshots(id, version, function(err, snapshots) {
        if (err)
          return res.error(err, 400);

        res.json(snapshots);
      });
    }
  },

  /**
   * destroy:
   * --------
   * Remove the given snapshot from a space id and a graph version.
   *
   */
  destroy: {
    validate: {
      id: 'string',
      version: 'string',
      snapshotId: 'string'
    },
    policies: 'authenticated',
    method: function(req, res) {
      var id = req.param('id'),
          version = +req.param('version'),
          snapshotId = req.param('snapshotId');

      repositories.space.removeSnapshot(id, version, snapshotId, function(err) {
        if (err && ~err.message.search(/inexistant/))
          return res.error(err, 404);
        else if (err)
          return res.error(err, 400);

        res.json({ok: true});
      });
    }
  }
};
