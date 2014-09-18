;(function(undefined) {

  /**
   * TubeMyNet Schemas
   * ==================
   *
   * Data validation schemas for the controller's properties.
   */

  app.schemas = {
    space: {
      id: 'string',
      email: '?string',
      version: 'number'
    },
    graph: {
      id: '?string',
      nodes: '?array',
      edges: '?array'
    },
    meta: 'object',
    snapshots: 'array',
    narratives: [{
      title: 'string',
      text: '?string',
      snapshot: 'string'
    }],
    sigma: function(v) {
      return v instanceof sigma;
    }
  };

  // Adding to domino structures
  for (var k in app.schemas)
    domino.struct.add({
      id: k,
      struct: app.schemas[k]
    });
}).call(this);
