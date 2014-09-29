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
      dispatch: ['data.updated', 'narratives.updated'],
      description: '[data] - The current graph\'s narratives.',
      type: 'narratives',
      value: []
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
    {
      id: 'currentNarrative',
      dispatch: ['currentNarrative.updated'],
      description: '[state] - The current narrative being edited.',
      type: '?string',
      value: null
    },
    {
      id: 'currentSlide',
      dispatch: ['currentSlide.updated'],
      description: '[state] - The current edited narrative slide by its snasphot id.',
      type: '?string',
      value: null
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
      type: '?element',
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
        return app.utils.extend((this.get('meta') || {}).forceAtlasConfig || {}, app.settings.forceAtlas2);
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
    },
    {
      id: 'hasSnapshots',
      description: 'Returns whether snapshots exist for the graph.',
      method: function() {
        return !!this.get('snapshots').length;
      }
    },
    {
      id: 'nodeModel',
      description: 'Little helper to return a node model if existant or an empty array otherwise.',
      method: function() {
        return ((this.get('meta') || {}).model || {}).node || [];
      }
    }
  ];

  // Model queries
  app.queries = [
    {
      id: 'nodeCategory',
      description: 'Retrieve a precise node category else undefined.',
      method: function(name) {
        var model = this.expand('nodeModel');

        return app.utils.first(model, function(category) {
          return name === category.id;
        });
      }
    },
    {
      id: 'snapshotById',
      description: 'Retrieves a snasphot by its id else undefined.',
      method: function(id) {
        var snapshots = this.get('snapshots');

        return app.utils.first(snapshots, function(snapshot) {
          return id === snapshot.id;
        });
      }
    },
    {
      id: 'snasphotsById',
      description: 'Retrieves array of snapshots by their id.',
      method: function(ids) {
        var snapshots = this.get('snasphots');

        return snapshots.filter(function(snapshot) {
          return ~id.indexOf(snapshot.id);
        });
      }
    },
    {
      id: 'narrativeById',
      description: 'Retrieves a narrative by its id else undefined.',
      method: function(id) {
        var narratives = this.get('narratives');

        return app.utils.first(narratives, function(narrative) {
          return id === narrative.id;
        });
      }
    },
    {
      id: 'currentSlide',
      description: 'Retrieves a slide by its snapshot it.',
      method: function() {
        var narratives = this.get('narratives'),
            currentId = this.get('currentNarrative'),
            currentSlideId = this.get('currentSlide'),
            current = app.utils.first(narratives, function(n) {
              return n.id === currentId;
            });

        if (!current)
          return null;

        return app.utils.first(current.slides, function(slide) {
          return slide.snapshot === currentSlideId;
        });
      }
    },
    {
      id: 'touchNarrative',
      description: 'Edit the modified object to tell a precise narrative has been updated.',
      method: function(id) {
        var modified = this.get('modified');

        modified.narratives = modified.narratives || [];
        if (!~modified.narratives.indexOf(id))
          modified.narratives.push(id);

        this.update('modified', modified);
      }
    }
  ];
}).call(this);
