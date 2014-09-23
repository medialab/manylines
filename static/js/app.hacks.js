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
     * Called when the application is deemed initialized by the init script.
     */
    {
      triggers: 'app.initialized',
      method: function(e) {

        // We now load the hash
        app.control.dispatchEvent('hash.load', {hash: window.location.hash});
      }
    },

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

        // If the graph has not been saved yet, we check the storage
        if (!spaceId || !version) {
          this.dispatchEvent('storage.load');
        }

        // Do we need to retrieve space data?
        if (spaceId && !this.expand('version')) {
          this.request('space.load', {
            shortcuts: {
              spaceId: spaceId,
              version: version
            }
          });

          this.request('narratives.load', {
            shortcuts: {
              spaceId: spaceId,
              version: version
            }
          });
        }

        this.update('pane', wantedPane);
      }
    },

    /**
     * When the local storage has been hit.
     */
    {
      triggers: 'storage.loaded',
      method: function(e) {

        // If not data were to be found, we go to upload
        if (!e.data)
          return this.update('pane', 'upload');

        // Else we update the data accordingly
        this.update('graph', e.data.graph);
        this.update('meta', e.data.meta);
        this.update('modified', e.data.modified);
        this.update('narratives', e.data.narratives);

        this.dispatchEvent('graph.render');

        // TODO: if we do have a spaceId, we check our space id hash and we
        // look for our id. if not, we clean the store and load the server data
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

        this.dispatchEvent('graph.render');

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
     * The graph has been updated and needs to be rendered
     */
    {
      triggers: 'graph.render',
      method: function(e) {

        if (e.data.noRender)
          return;

        var s = this.get('mainSigma');
        s.graph.clear().read(this.get('graph'));

        s.refresh();
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

            // TODO: domino has a bug where it will force the execution
            // of twice the first service here...

            // Saving graph
            if ('graph' in modified)
              this.request('graph.update', {
                data: {
                  graph: this.get('graph')
                }
              });

            // Saving meta
            if ('meta' in modified)
              this.request('meta.update', {
                data: {
                  meta: this.get('meta')
                }
              });

            // Saving narratives
            if ('narratives' in modified) {
              modified.narratives.forEach(function(nid) {
                var narrative = app.control.query('narrativeById', nid);

                if (nid === 'temp') {

                  // Creating the narrative
                  this.request('narrative.save', {
                    data: {
                      narrative: {
                        title: narrative.title,
                        slides: narrative.slides
                      }
                    }
                  });
                }
                else {

                  // Updating the narrative
                }
              }, this);
            }
          }
        }
      }
    },

    /**
     * Update the layout settings
     */
    {
      triggers: 'layout.update',
      method: function(e) {
        var meta = this.get('meta'),
            modified = this.get('modified');

        var newLayout = app.graph.layoutConstraints(e.data);
        meta.forceAtlasConfig = newLayout;

        this.update('meta', meta);

        modified.meta = true;
        this.update('modified', modified);
        this.dispatchEvent('layout.updated', newLayout);
      }
    },

    /**
     * Layout start
     */
    {
      triggers: 'layout.start',
      method: function(e) {
        var modified = this.get('modified');

        modified.graph = true;
        this.update('modified', modified);
      }
    },

    /**
     * Layout stop
     */
    {
      triggers: 'layout.stop',
      method: function(e) {
        var newGraph = this.get('mainSigma').retrieveGraphData();
        this.update('graph', newGraph);
      }
    },

    /**
     * Attempting to take a snapshot of the graph
     */
    {
      triggers: 'snapshot.take',
      method: function(e) {
        var s = this.get('mainSigma');

        // If the graph has not been saved yet, we shun the user
        if (this.expand('isSpaceNew'))
          return this.dispatchEvent('error', {reason: 'dev - graph must be saved.'});

        // Else we can proceed
        this.request('snapshot.save', {
          data: {
            snapshot: {
              view: {
                camera: s.saveCamera('main')
              },
              filters: e.data.filter ? [e.data.filter] : []
            }
          }
        });
      }
    },

    /**
     * Adding a narrative.
     */
    {
      triggers: 'narrative.add',
      method: function(e) {
        var newNarrative = {
          id: 'temp',
          title: i18n.t('narratives.default_narrative_title'),
          slides: []
        };

        var narratives = this.get('narratives'),
            modified = this.get('modified');

        narratives.push(newNarrative);
        modified.narratives = modified.narratives || [];
        modified.narratives.push('temp');

        // Updating properties
        this.update('narratives', narratives);
        this.update('modified', modified);
        this.update('currentNarrative', 'temp');

        // Dispatching
        this.dispatchEvent('narrative.added', newNarrative);
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
