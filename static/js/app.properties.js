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
    },

    /**
     * Sigma
     * ------
     */
    {
      id: 'mainSigma',
      description: 'Main sigma instance used by the application.',
      type: '?sigma',
      value: null
    },

    // TODO: enforce through a better type
    {
      id: 'mainRendererContainer',
      description: 'Main sigma renderer container cached for optimization purposes.',
      type: '?*',
      value: null
    }
  ];

  // Model shortcuts
  app.shortcuts = [
    {
      id: 'spaceId',
      description: 'Returns the current space id if present or undefined.',
      method: function() {
        return (this.get('space') || {}).id;
      }
    },
    {
      id: 'version',
      description: 'Returns the current version of the graph or undefined.',
      method: function() {
        return (this.get('space') || {}).version;
      }
    },
    {
      id: 'forceAtlasConfig',
      description: 'Retrieves Force Atlas configuration through the meta property.',
      method: function() {
        return (this.get('meta') || {}).forceAtlasConfig;
      }
    },
    {
      id: 'isModified',
      description: 'Returns whether anything has been modified yet and needs to be saved.',
      method: function() {
        return !!Object.keys(this.get('modified')).length;
      }
    },
    {
      id: 'isSpaceNew',
      description: 'Returns whether the current space has already been saved at least once.',
      method: function() {

        // Alias of the spaceId shortcut for readability purposes
        return !this.expand('spaceId');
      }
    }
  ];
}).call(this);
