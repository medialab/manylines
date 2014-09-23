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
    slide: {
      title: 'string',
      text: 'string',
      snapshot: 'string'
    },
    narratives: [{
      id: 'string',
      title: 'string',
      slides: ['slide']
    }],
    sigma: function(v) {
      return v instanceof sigma;
    },
    element: function(v) {
      return v instanceof Element;
    }
  };

  // Adding to domino structures
  for (var k in app.schemas)
    domino.struct.add({
      id: k,
      struct: app.schemas[k]
    });
}).call(this);
