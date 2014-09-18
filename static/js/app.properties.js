;(function(undefined) {

  /**
   * TubeMyNet Controller Properties
   * ================================
   *
   * Collection of properties needed for the controller to run its model.
   */

  // Model properties
  app.properties = [

    /**
     * Application data
     * -----------------
     */
    {
      id: 'space',
      dispatch: 'space.updated',
      description: '[data] - The object describing the current session.',
      type: '?space',
      value: null
    },
    {
      id: 'graph',
      dispatch: ['data.updated', 'graph.updated'],
      description: '[data] - The current graph data.',
      type: '?graph',
      value: null
    },
    {
      id: 'meta',
      dispatch: ['data.updated', 'meta.updated'],
      description: '[data] - The current graph meta object.',
      type: '?meta',
      value: null
    },
    {
      id: 'snapshots',
      dispatch: ['snapshots.updated'],
      description: '[data] - The current graph\'s snapshots.',
      type: 'snapshots',
      value: []
    },
    {
      id: 'narratives',
      dispatch: ['narratives.updated'],
      description: '[data] - The current graph\'s narratives.',
      type: '?narratives',
      value: null
    },

    /**
     * Application state
     * ------------------
     */
    {
      id: 'pane',
      dispatch: ['pane.updated'],
      description: '[state] - The current active pane.',
      type: 'string',
      value: ''
    },
    {
      id: 'lastPane',
      description: '[state] - Last active pane. Useful when user needs to log then go back to previous state.',
      type: '?string',
      value: null
    },
    {
      id: 'modified',
      dispatch: ['modified.updated'],
      description: '[state] - Object keeping track of modified data so we can save the latest update when asked.',
      type: 'object',
      value: {}
    }
  ];

  // TODO: Probably move elsewhere
  app.temporaryFacets = [
    {
      id: 'spaceId',
      description: 'Returns the current space id if present or null.',
      method: function() {
        return (this.get('space') || {}).id || null;
      }
    }// version?, something modified?
  ];
}).call(this);
