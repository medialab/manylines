;(function(undefined) {

  /**
   * TubeMyNet Hacks
   * ================
   *
   * Listening to main events.
   */

  // Simple extraneous events
  var eventsRegister = [
    'modal',
    'error',
    'warning',
    'info',
    'storage.clear',
    'hash.update'
  ];

  // Application hacks
  var hacks = {};

  /**
   * State-related hacks
   * --------------------
   */
  hacks.state = [

    /**
     * Login is required to continue.
     */
    {
      triggers: 'login.required',
      method: function(e) {
        var pane = this.get('pane');

        if (pane === 'login')
          return;

        this.update('lastPane', pane);
        this.update('pane', 'login');
      }
    },

    /**
     * Attempt to log in.
     */
    {
      triggers: 'login.attempt',
      method: function(e) {
        var hash = app.utils.parseHash(window.location.hash);

        this.request('login', {
          shortcuts: {
            spaceId: hash.spaceId,
            password: e.data
          }
        });
      }
    },

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
        var hash = app.utils.parseHash(e.data.hash);

        this.update('lastPane', hash.pane);

        if (hash.pane === 'login')
          return this.dispatchEvent('login.required');

        // First of all we try to retrieve data from server
        if (hash.spaceId && hash.version)
          return this.dispatchEvent('data.load', {
            spaceId: hash.spaceId,
            version: hash.version
          });

        // Else we try to get unsaved data from the localstorage
        this.dispatchEvent('storage.load');
      }
    },

    /**
     * The hash has been changed voluntarily.
     */
    {
      triggers: 'hash.changed',
      method: function(e) {
        var hash = app.utils.parseHash(e.data.hash);

        if (hash.pane !== this.get('pane'))
          this.update('pane', hash.pane);
      }
    },

    /**
     * Loading application data from server.
     */
    {
      triggers: 'data.load',
      method: function(e) {

        // Space data
        this.request('space.load', {
          shortcuts: {
            spaceId: e.data.spaceId,
            version: e.data.version
          }
        });

        // Narratives data
        this.request('narratives.load', {
          shortcuts: {
            spaceId: e.data.spaceId,
            version: e.data.version
          }
        });
      }
    },

    /**
     * When the local storage has been hit.
     */
    {
      triggers: 'storage.loaded',
      method: function(e) {
        var storage = e.data.storage;

        // If not data were to be found, we go to upload
        if (!storage || (storage.space && this.expand('isSpaceNew')))
          return this.update('pane', 'upload');

        // Else we update the data accordingly
        this.update('space', storage.space);
        this.update('graph', storage.graph);
        this.update('meta', storage.meta);
        this.update('modified', storage.modified);
        this.update('narratives', storage.narratives);

        this.dispatchEvent('graph.render');

        this.update('pane', this.get('lastPane') || 'basemap');
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

        if (!this.expand('hasSnapshots') && desiredPane === 'narratives') {
          this.dispatchEvent('warning', {reason: 'narratives.impossible'});
          return;
        }

        if (desiredPane === 'dashboard')
          return this.dispatchEvent('info', {reason: 'dashboard.impossible'});

        this.update('pane', desiredPane);
      }
    },

    /**
     * Going back to narratives list
     */
    {
      triggers: 'narratives.back',
      method: function(e) {
        this.update('currentNarrative', null);
        this.update('currentSlide', null);
      }
    },

    /**
     * Ensuring the modified object remains clean
     */
    {
      triggers: 'modified.updated',
      method: function(e) {
        var modified = this.get('modified');

        if (modified.narratives && !modified.narratives.length) {
          delete modified.narratives;
          this.update('modified', modified);
        }
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
                  this.request('narrative.update', {
                    shortcuts: {
                      id: nid
                    },
                    data: {
                      narrative: {
                        title: narrative.title,
                        slides: narrative.slides
                      }
                    }
                  });
                }
              }, this);
            }
          }
        }
      }
    },

    /**
     * Attempt to bump the current space
     */
    {
      triggers: 'bump',
      method: function(e) {
        this.request('space.bump', {
          data: {
            graph: this.get('graph'),
            meta: this.get('meta')
          }
        });
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
          return this.dispatchEvent('error', {reason: 'snapshots.impossible'});

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
    },

    /**
     * Selecting a narrative
     */
    {
      triggers: 'narrative.select',
      method: function(e) {
        this.update('currentNarrative', e.data);
      }
    },

    /**
     * Selecting a slide
     */
    {
      triggers: 'slide.select',
      method: function(e) {
        this.update('currentSlide', e.data);
      }
    },

    /**
     * Editing a narrative
     */
    {
      triggers: 'narrative.edit',
      method: function(e) {
        var narratives = domino.utils.clone(this.get('narratives')),
            currentId = this.get('currentNarrative'),
            current = app.utils.first(narratives, function(n) {
              return n.id === currentId;
            });

        // Updating title
        if (e.data.title) {
          current.title = e.data.title;
        }

        // Adding a slide
        // TODO: there is something fishy here in the way domino deals with references...
        if (e.data.addSlide) {
          var newSlide = {
            title: i18n.t('narratives.default_slide_title'),
            text: '',
            snapshot: e.data.addSlide
          };

          current.slides.push(newSlide);
          this.update('currentSlide', e.data.addSlide);
        }

        // Editing a slide
        if (e.data.editSlide) {
          var update = e.data.editSlide;
          var slide = app.utils.first(current.slides, function(s) {
            return this.get('currentSlide') === s.snapshot;
          }, this);

          update.title && (slide.title = update.title)
          update.text && (slide.text = update.text)
        }

        // Removing a slide
        if (e.data.removeSlide) {
          current.slides = current.slides.filter(function(slide) {
            return slide.snapshot !== e.data.removeSlide;
          });

          this.update('currentSlide', (current.slides[0] || {}).snapshot || null);
        }

        // Reordering slides
        if (e.data.reorderSlides) {
          var slideIndex = app.utils.indexBy(current.slides, 'snapshot');

          var newOrder = e.data.reorderSlides.map(function(snapshot) {
            return slideIndex[snapshot];
          });

          current.slides = newOrder;
        }

        // Updating
        this.update('narratives', narratives);

        // Touching
        app.control.query('touchNarrative', currentId);
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
