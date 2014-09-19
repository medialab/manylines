;(function(undefined) {

  /**
   * TubeMyNet Hacks
   * ================
   *
   * Listening to main events.
   */

  // Simple extraneous events
  var eventsRegister = [
    'hash.changed',
    'error',
    'warning',
    'info'
  ];

  // Application hacks
  var hacks = {};

  /**
   * State-related hacks
   * -------------------
   */
  hacks.state = [

    /**
     * Loads the application hash for the first time then set the pane
     * accordingly.
     */
    {
      triggers: 'hash.load',
      method: function(e) {
        var hash = e.data.hash;

        if (!hash) {
          hash = '/upload';
          window.location.hash = hash;
          this.update('pane', 'upload');
          return;
        }

        // Which pane is requested?
        var hashSplit = hash.split('/'),
            wantedPane = hashSplit[1],
            spaceId = hashSplit[2],
            version = hashSplit[3];

        // We want to start a space obviously
        if (!spaceId || !version)
          return this.update('pane', 'upload');

        // Do we need to retrieve space data?
        if (spaceId && !this.expand('version'))
          this.request('space.load', {
            shortcuts: {
              spaceId: spaceId,
              version: version
            }
          });

        this.update('pane', wantedPane);
      }
    },

    /**
     * User attempts to change pane through menu
     */
    {
      triggers: 'menu.request',
      method: function(e) {
        var desiredPane = e.data;

        if (!this.get('graph') && desiredPane !== 'upload')
          return;

        this.update('pane', desiredPane);
      }
    }
  ];

  /**
   * Data-related hacks
   * -------------------
   */
  hacks.data = [

    /**
     * A graph has been uploaded
     */
    {
      triggers: 'graph.uploaded',
      method: function(e) {
        var graph = e.data.graph,
            meta = {};

        // Applying model to meta object
        if (e.data.model) {
          meta.model = e.data.model

          // Applying color to the node model if needed
          if (meta.model.node)
            app.graph.applyCategoriesColors(meta.model.node, graph);
        }

        // Registering other metadata
        for (var k in e.data.meta)
          meta[k] = e.data.meta[k];

        // Reading graph
        var s = this.get('mainSigma');
        s.graph.clear().read(graph);

        // Updating properties
        this.update({
          graph: graph,
          meta: meta,
          modified: {
            graph: true,
            meta: true
          },
          pane: 'basemap'
        });
      }
    },

    /**
     * Attempt to save the current space
     */
    {
      triggers: 'save',
      method: function(e) {
        var newSpace = this.expand('isSpaceNew');

        // If the space has not been create yet, we display the save form
        if (newSpace && !e.data.create) {
          this.dispatchEvent('modal', {type: 'save'});
        }

        // Else we do request data save
        else {

          if (newSpace) {

            // Creating a new space
            this.request('space.create', {
              data: {
                email: e.data.email,
                password: e.data.password,
                graph: this.get('graph'),
                meta: this.get('meta')
              }
            });
          }
          else {

            // Saving the current space
            var modified = this.get('modified');

            // TODO: route to update metas
            // TODO: possibility to update narratives
          }
        }

      }
    }
  ];

  // Exporting
  app.hacks = []
    .concat(hacks.state)
    .concat(hacks.data);

  // Applying extraneous events
  eventsRegister.forEach(function(e) {
    app.hacks.push({triggers: e});
  });
}).call(this);
