;(function() {
  'use strict';

  /**
   * Initialize the main sigma instance:
   * ***********************************
   */

  // Instanciating sigma
  var s = new sigma({
    settings: app.defaults.sigma
  });

  // Creating a main camera
  s.addCamera('mainCamera');

  // Creating a main renderer
  var sigmaContainer = document.createElement('div');
  sigmaContainer.setAttribute('class', 'sigma-expand');

  s.addRenderer({
    container: sigmaContainer,
    camera: 'mainCamera',
    type: app.defaults.renderer,
    id: 'mainRenderer'
  });


  // TODO: Clear that HACK
  // Fixes problem with sigma and window resizing
  window.addEventListener('resize', function() {
    window.setTimeout(s.refresh.bind(s), 0);
  });

  /**
   * Custom settings:
   * ****************
   */
  domino.settings({
    displayTime: true,
    verbose: true,
    strict: true
  });

  /**
   * Useful tricks:
   * **************
   */
  var appBefore = function() {
    return this.get('initialized');
  };

  /**
   * Custom data structures:
   * ***********************
   */
  if (!domino.struct.isValid('Config'))
    domino.struct.add({
      id: 'Space',
      struct: {
        id: 'string',
        email: '?string',
        version: 'number'
      }
    });

  if (!domino.struct.isValid('Graph'))
    domino.struct.add({
      id: 'Graph',
      struct: {
        id: '?string',
        nodes: '?array',
        edges: '?array'
      }
    });

  if (!domino.struct.isValid('Meta'))
    domino.struct.add({
      id: 'Meta',
      struct: 'object'
    });

  if (!domino.struct.isValid('Snapshots'))
    domino.struct.add({
      id: 'Snapshots',
      struct: 'array'
    });

  if (!domino.struct.isValid('sigma'))
    domino.struct.add(
      'sigma',
      function(v) {
        return v instanceof sigma;
      }
    );

  app.control = new domino({
    properties: [
      /**
       * DATA:
       * *****
       */
      {
        id: 'spaceId',
        triggers: 'updateSpaceId',
        dispatch: 'spaceIdUpdated',
        description: 'The ID of the space to load.',
        type: '?string',
        value: null
      },
      {
        id: 'version',
        triggers: 'updateVersion',
        dispatch: 'versionUpdated',
        description: 'The version of the graph / meta in the space.',
        type: '?number',
        value: null
      },
      {
        id: 'space',
        triggers: ['updateData', 'updateSpace'],
        dispatch: ['dataUpdated', 'spaceUpdated'],
        description: 'The current space (basically the historic of some graphs and the related metadata objects).',
        type: '?Space',
        value: null
      },
      {
        id: 'graph',
        triggers: ['updateData', 'updateGraph'],
        dispatch: ['dataUpdated', 'graphUpdated'],
        description: 'The current graph.',
        type: '?Graph',
        value: null
      },
      {
        id: 'meta',
        triggers: ['updateData', 'updateMeta'],
        dispatch: ['dataUpdated', 'metaUpdated'],
        description: 'The current graph meta object.',
        type: '?Meta',
        value: null
      },
      {
        id: 'snapshots',
        triggers: ['updateData', 'updateSnapshots'],
        dispatch: ['dataUpdated', 'snapshotsUpdated'],
        description: 'The current graph\'s snapshots.',
        type: '?Snapshots',
        value: null
      },

      /**
       * SIGMA:
       * ******
       */
      {
        id: 'mainSigma',
        description: 'The main sigma instance.',
        type: 'sigma',
        value: s
      },
      {
        id: 'mainRendererContainer',
        description: 'The main sigma renderer\'s container.',
        type: 'object',
        value: sigmaContainer
      },

      /**
       * APP STATE:
       * **********
       */
      {
        id: 'initialized',
        description: 'A flag indicating if the controller has been properly initialized.',
        type: 'boolean',
        value: false
      },
      {
        id: 'dataLoaded',
        description: 'A flag indicating if the controller has loaded relevant data.',
        value: false
      },
      {
        id: 'view',
        triggers: 'updateView',
        dispatch: 'viewUpdated',
        description: 'The current view. Available values: "login", "upload", "basemap", "dashboard", "views", "narratives"',
        type: 'string',
        value: ''
      },
      {
        id: 'lastView',
        triggers: 'updateLastView',
        dispatch: 'lastViewUpdated',
        description: 'The latest set view (useful when going to the logging view temporarily).',
        type: '?string',
        value: null
      },
      {
        id: 'isModified',
        triggers: 'updateIsModified',
        dispatch: 'isModifiedUpdated',
        description: 'An object specifying what has been updated since the last update.',
        type: '?object',
        value: null
      },

      /**
       * EXPLORE:
       * ********
       */
      {
        id: 'explore-mode',
        triggers: 'explore-updateMode',
        dispatch: 'explore-modeUpdated',
        description: '[explore view] The mode of exploration.',
        type: 'string',
        value: 'overview'
      },
      {
        id: 'explore-layout',
        triggers: 'explore-updateLayout',
        dispatch: 'explore-layoutUpdated',
        description: '[explore view] The currently used layout.',
        type: '?string',
        value: null
      }
    ],
    hacks: [
      /**
       * Initialization process:
       * ***********************
       */
      {
        triggers: 'init',
        method: function() {
          // This hack is the first to be called by the controller in order
          // to initialize the application.
          // Its role for the time being is just to process the hash

          // Temporary dirty scheme
          this.update('initialized', true);
          this.dispatchEvent('loadHash');
        }
      },
      {
        triggers: 'loadHash',
        method: function() {

          // Read URL hash:
          this.dispatchEvent('hashUpdated', {
            hash: window.location.hash
          });
        }
      },
      {
        triggers: 'loadWebStorage',
        method: function(e) {

          // First we try reaching the server to get data

          // If the space does not exist, we kick the user

          // If we succeed, we try getting the localStorage items to check
          // whether some unsave data exists

          // TODO: If server is unreachable we hit localStorage
          // else we kick the user

          // Requesting server data only if spaceId is present, else localStorage
          if (this.get('spaceId'))
            this.request('loadGraphData');
          else
            this.dispatchEvent('loadLocalStorage');
        }
      },
      {
        triggers: 'localStorageLoaded',
        method: function(e) {

          if (e.data)
            this.update(e.data);

          this.update('dataLoaded', false);
        }
      },

      /**
       * URL Hash management:
       * ********************
       */
      {
        triggers: ['viewUpdated', 'spaceIdUpdated'],
        method: function(e) {
          var hash,
              version = this.get('version'),
              spaceId = this.get('spaceId'),
              view = this.get('view');

          switch (view) {
            // Views with mandatory spaceId:
            case 'login':
              if (!spaceId) {
                this.log('The space ID is missing. The view is set to "upload".');
                hash = '#/upload';
              } else {
                hash = '#/' + view + '/' + spaceId + '/' + version;
              }
              break;

            // Views with optional spaceId:
            case 'upload':
            case 'basemap':
            case 'dashboard':
            case 'views':
            case 'narratives':
              if (!spaceId || typeof version !== 'number')
                hash = '#/' + view;
              else
                hash = '#/' + view + '/' + spaceId + '/' + version;
              break;

            // Default cases:
            default:
              hash = '#/upload';
              break;
          }

          // Effectively update the hash:
          this.dispatchEvent('updateHash', {
            hash: hash
          });
        }
      },
      {
        triggers: 'hashUpdated',
        method: function(e) {
          var hash = e.data.hash.replace(/^#\//, '').split('/'),
              view = hash[0];

          this.log('Hash updated:', hash);

          // Check view:
          view = view || 'upload';
          this.update('view', view);

          switch (view) {
            // Specific "login" view case:
            case 'login':
              if (hash.length <= 1) {
                this.log('The space ID is missing. The view is set to "upload".');
                this.update('view', 'upload');
                this.update('spaceId', null);
                this.update('version', null);
              } else if (hash.length <= 2) {
                this.update('spaceId', hash[1]);
                this.update('version', null);
              } else {
                this.update('spaceId', hash[1]);
                this.update('version', +hash[2]);
              }
              break;

            // Specific "upload" view case:
            case 'upload':
              if (hash.length <= 1) {
                this.update('spaceId', null);
                this.update('version', null);
              } else if (hash.length <= 2) {
                this.update('spaceId', hash[1]);
                this.update('version', null);
              } else {
                this.update('spaceId', hash[1]);
                this.update('version', +hash[2]);
              }
              break;

            // Views with optional spaceId / version:
            case 'basemap':
            case 'dashboard':
            case 'views':
            case 'narratives':

              // Do we need to initialize data?
              if (!this.get('graph')) {
                this.update('spaceId', hash[1]);
                this.update('version', + (hash[2] || 0));

                this.dispatchEvent('loadWebStorage');
              } else if (hash.length <= 2) {
                if (!this.get('graph')) {
                  this.log('The space ID and graph are missing. The view is set to "upload".');
                  this.update('view', 'upload');
                }

                this.update('spaceId', null);
                this.update('version', null);
              } else {

                this.update('spaceId', hash[1]);
                this.update('version', +hash[2]);
              }
              break;

            // Default cases:
            default:
              this.update('view', 'upload');
              this.update('spaceId', null);
              this.update('version', null);
              break;
          }
        }
      },

      /**
       * Login / logout management:
       * **************************
       */
      {
        triggers: 'login',
        method: function(e) {
          this.request('login', {
            shortcuts: {
              password: e.data.password
            }
          });
        }
      },
      {
        triggers: 'requireLogin',
        method: function(e) {
          var view = this.get('view');

          if (view !== 'login')
            this.update('lastView', view !== 'login' ? view : null);
          this.update('view', 'login');
        }
      },
      {
        triggers: 'logout',
        method: function(e) {
          this.request('logout');
        }
      },

      /**
       * Data synchronization:
       * *********************
       */
      {
        triggers: 'graphUploaded',
        method: function(e) {
          var k,
              meta = this.get('meta') || {},
              graph = e.data.graph;

          if (e.data.model)
            meta.model = e.data.model;
          if (e.data.meta)
            for (k in e.data.meta)
              meta[k] = e.data.meta[k];

          // TODO:
          // This is quite strict. It only works with GEXF, and I am not even
          // sure it works with all versions of them.
          ((meta.model || {}).node || []).forEach(function(cat) {
            var k,
                a,
                o,
                scale,
                colors,
                colorsThreshold = 5;

            switch (cat.type) {
              case 'liststring':
                o = graph.nodes.reduce(function(values, n) {
                  n.attributes[cat.id].forEach(function(val) {
                    values[val] = (values[val] || 0) + 1;
                  }, {});
                  return values;
                }, {});
                break;
              case 'string':
                o = graph.nodes.reduce(function(values, n) {
                  var val = n.attributes[cat.id]
                  if (val)
                    values[val] = (values[val] || 0) + 1;
                  return values;
                }, {});
                break;
              default:
                cat.noDisplay = true;
            }

            if (!o)
              return;

            cat.values = [];
            for (k in o || {}) {
              cat.minValue = Math.min(cat.maxValue || Infinity, o[k]);
              cat.maxValue = Math.max(cat.maxValue || -Infinity, o[k]);
              cat.values.push({
                id: k,
                value: o[k]
              });
            }

            // Sort values
            cat.values = cat.values.sort(function(a, b) {
              return b.value - a.value;
            });

            // Colors
            colors = buildColors(Math.min(cat.values.length, colorsThreshold));
            cat.values.forEach(function(v, i, a) {
              v.color = colors[i];
              v.percentValue = v.value * 100 / cat.maxValue;
            });

            function buildColors(count){
              // Colors from iWantHue
              // H: 0 to 360
              // C: 1.11 to 2.31
              // L: 0.66 to 1.39
              switch(count){
                case 1:
                  return ['#6889AB'];
                  break;
                case 2:
                  return ["#3CC426",
                    "#D058AF"];
                  break;
                case 3:
                  return ["#3CC426",
                    "#BE60D4",
                    "#EC4042"];
                  break;
                case 4:
                  return ["#CB9A29",
                    "#A682D0",
                    "#E35466",
                    "#70C950"];
                  break;
                case 5:
                  return ["#E05F3D",
                    "#67C845",
                    "#8286DA",
                    "#DD5FAE",
                    "#C4B322"];
                  break;
                case 6:
                  return ["#DF6240",
                    "#79D83F",
                    "#828BD7",
                    "#DB62AB",
                    "#C4B32D",
                    "#54B962"];
                  break;
                case 7:
                  return ["#50BC65",
                    "#DA65B4",
                    "#D37F29",
                    "#818CD6",
                    "#B4B62F",
                    "#E45356",
                    "#7AD940"];
                  break;
                case 8:
                  return ["#65DD5D",
                    "#D769BB",
                    "#D28129",
                    "#5B97CF",
                    "#E3535F",
                    "#BEC932",
                    "#9263DE",
                    "#5C9F45"];
                  break;
                case 9:
                  return ["#888AD6",
                    "#69DC47",
                    "#D7802C",
                    "#11B0A7",
                    "#D964B5",
                    "#E45556",
                    "#ACA02B",
                    "#60B65A",
                    "#C7DE3F"];
                  break;
                case 10:
                  return ["#50A3CB",
                    "#C8DA3C",
                    "#E05F3D",
                    "#D26EC9",
                    "#44CB91",
                    "#CA962B",
                    "#DF5683",
                    "#6ADC4F",
                    "#8967DA",
                    "#6BA13C"];
                  break;
                default:
                  var colors = [];
                  for(var i=0; i<count; i++){
                    colors.push(chroma.rgb(Math.random()*255,Math.random()*255,Math.random()*255).hex());
                  }
                  return colors;
                  break;
              }

            }

            // Reset colors over the 5th one to #ccc:
            cat.values.forEach(function(v, i, a) {
              if (i >= colorsThreshold)
                v.color = app.defaults.colors.weakCategory;
            });

            if (cat.values.length > graph.nodes.length / 2)
              cat.noDisplay = true;

            if (cat.values.length < 2)
              cat.noDisplay = true;
          });

          this.update({
            dataLoaded: true,
            graph: graph,
            meta: meta,
            view: 'basemap',
            isModified: {
              graph: true,
              meta: true
            }
          });
        }
      },
      {
        triggers: 'save',
        method: function(e) {
          var modified = this.get('isModified');

          if (!this.get('spaceId'))
            this.dispatchEvent('openSpaceForm');
          else if (Object.keys(modified || {}).length) {
            var k,
                data = {};

            for (k in modified)
              data[k] = this.get(k);

            if (typeof this.get('version') !== 'number' ||
                isNaN(this.get('version')))
              this.update('version', 0);

            this.request('saveGraphData', {
              data: data
            });
          }
        }
      },
      {
        triggers: 'createSpace',
        method: function(e) {
          this.request('createSpace', {
            data: {
              email: e.data.email,
              password: e.data.password
            }
          });
        }
      },
      {
        triggers: 'takeSnapshot',
        method: function(e) {
          var cam = this.get('mainSigma').cameras['mainCamera'];

          this.request('snapshotGraph', {
            data: {
              view: {
                camera: {
                  x: cam.x,
                  y: cam.y,
                  ratio: cam.ratio,
                  angle: cam.angle
                }
              },
              filters: [e.data.filter]
            }
          });
        }
      },
      {
        triggers: 'spaceIdUpdated',
        method: function(e) {
          // Load the space data if needed:
          if (
            this.get('spaceId') !== (this.get('space') || {}).id &&
            this.get('spaceId') &&
            this.get('view') !== 'login'
          )
            this.request('loadSpace');
        }
      },
      {
        triggers: ['updateGraph', 'updateMeta', 'updateData'],
        method: function(e) {
          var modified = this.get('isModified') || {},
              update = false;

          switch (e.type) {
            case 'updateGraph':
              update = true;
              modified.graph = true;
              break;
            case 'updateMeta':
              update = true;
              modified.meta = true;
              break;
          }

          if (update)
            this.update('isModified', modified);
        }
      },
      {
        triggers: 'graphUpdated',
        method: function(e) {
          var s = this.get('mainSigma');
          s.graph.clear().read(this.get('graph'));
          s.refresh();
        }
      },
      {
        triggers: 'graphLayout',
        method: function(e) {
          var graph = this.get('graph'),
              modified = this.get('isModified') || {};

          // Updating the graph without triggering updated events not to
          // trigger a sigma update
          graph.nodes = e.data.nodes;
          graph.edges = e.data.edges;

          // Updating isModified
          modified.graph = true;
          this.update('isModified', modified);
        }
      },
      {
        triggers: 'updateLayoutOptions',
        method: function(e) {
          var meta = this.get('meta');

          // Updating property without triggering updated events
          meta.layout = e.data;
        }
      },

      /**
       * Data update:
       * ************
       */
      {
        triggers: 'updateMetaKey',
        method: function(e) {
          var meta = this.get('meta') || {};
          meta[e.data.key] = e.data.value;

          this.dispatchEvent('updateMeta', {
            meta: meta
          });
        }
      },
      {
        triggers: 'saveSpaceKey',
        method: function(e) {
          var space = domino.utils.clone(this.get('space')) || {};
          space[e.data.key] = e.data.value;

          this.request('saveSpace', {
            data: space
          });
        }
      },
      {
        triggers: 'deleteSpace',
        method: function(e) {
          this.request('deleteSpace');
        }
      },
      {
        triggers: 'uploadGraph',
        method: function(e) {
          this.update('view', 'upload');
        }
      }

      /**
       * Temporary development stuffs:
       * *****************************
       */
    ],
    services: [
      /**
       * Login management:
       * *****************
       */
      {
        id: 'login',
        url: '/api/login/:spaceId/:password',
        dataType: 'json',
        before: appBefore,
        success: function(data) {
          var lastView = this.get('lastView');
          this.update('space', data);
          this.update('lastView', null);
          this.update('view', lastView || 'basemap');
        },
        error: function(m, x, p) {
          if (x.status)
            app.info(i18n.t('errors.unauthorized'));
          else
            app.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'logout',
        url: '/api/logout/:spaceId',
        dataType: 'json',
        before: appBefore,
        success: function(data) {
          this.update('spaceId', null);
          this.update('view', 'upload');
        },
        error: function(m, x, p) {
          app.danger(i18n.t('errors.default'));
        }
      },

      /**
       * Space management:
       * *****************
       */
      {
        id: 'createSpace',
        url: '/api/space',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        before: appBefore,
        success: function(data) {
          this.update('space', data);
          this.update('spaceId', data.id);
          this.dispatchEvent('save');
        },
        error: function(m, x, p) {
          if (m === 'Invalid email')
            app.info(i18n.t('warnings.invalid_email'));
          else if (m === 'Invalid password')
            app.info(i18n.t('warnings.invalid_password'));
          else
            app.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'loadSpace',
        url: '/api/space/:spaceId',
        dataType: 'json',
        type: 'GET',
        before: appBefore,
        success: function(data) {
          this.update('space', data);

          if (typeof this.get('version') !== 'number')
            this.update('version', 0);
        },
        error: function(m, x, p) {
          if (+x.status === 401)
            this.dispatchEvent('requireLogin');
          else
            app.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'saveSpace',
        url: '/api/space/:spaceId',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        before: appBefore,
        success: function(data, input) {
          var space = this.get('space');
          space.email = data.email;
          this.update('space', space);

          if (typeof this.get('version') !== 'number')
            this.update('version', 0);
        },
        error: function(m, x, p) {
          if (m === 'Invalid email')
            app.info(i18n.t('warnings.invalid_email'));
          else if (m === 'Invalid password')
            app.info(i18n.t('warnings.invalid_password'));
          else if (+x.status === 401)
            this.dispatchEvent('requireLogin');
          else
            app.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'deleteSpace',
        url: '/api/space/:spaceId',
        dataType: 'json',
        type: 'DELETE',
        before: appBefore,
        success: function(data) {
          this.update('space', null);
          this.update('spaceId', null);
          this.update('view', 'upload');
        },
        error: function(m, x, p) {
          if (+x.status === 401)
            this.dispatchEvent('requireLogin');
          else
            app.danger(i18n.t('errors.default'));
        }
      },

      /**
       * Graph and meta management:
       * **************************
       */
      {
        id: 'createGraphData',
        url: '/api/space/graph/:spaceId',
        dataType: 'json',
        type: 'POST',
        before: appBefore,
        success: function(data) {
          this.update('meta', data.meta);
          this.update('graph', data.graph);
          this.update('isModified', null);
        },
        error: function(m, x, p) {
          if (+x.status === 401)
            this.dispatchEvent('requireLogin');
          else
            app.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'loadGraphData',
        url: '/api/space/graph/:spaceId/:version',
        dataType: 'json',
        type: 'GET',
        before: function() {
          if (typeof this.get('version') !== 'number')
            return this.warn('A version number is needed for this request.');
          appBefore.apply(this, arguments);
        },
        success: function(data) {
          this.update('meta', data.meta);
          this.update('graph', data.graph);
          this.update('isModified', null);
          // this.dispatchEvent('loadLocalStorage');

          // Now requesting snapshots
          this.request('loadSnapshots');
        },
        error: function(m, x, p) {
          if (+x.status === 401)
            this.dispatchEvent('requireLogin');
          else
            app.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'saveGraphData',
        url: '/api/space/graph/:spaceId/:version',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        before: function() {
          if (typeof this.get('version') !== 'number')
            return this.warn('A version number is needed for this request.');
          appBefore.apply(this, arguments);
          this.dispatchEvent('saving');
        },
        success: function(data) {
          this.update('isModified', null);
          this.dispatchEvent('saved');
        },
        error: function(m, x, p) {
          app.danger(i18n.t('errors.default'));
        }
      },

      /**
       * Temporary development stuffs:
       * *****************************
       */

      // TODO: move this in more appropriate code area
      {
        id: 'snapshotGraph',
        url: '/api/space/snapshot/:spaceId/:version',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        before: function() {
          if (typeof this.get('version') !== 'number')
            return this.warn('A version number is needed for this request.');
          appBefore.apply(this, arguments);
        },
        success: function(data) {
          this.request('loadSnapshots');
          app.success(i18n.t('snapshots.saved'));
        },
        error: function(m, x, p) {
          app.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'loadSnapshots',
        url: '/api/space/snapshot/:spaceId/:version',
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        before: function() {
          if (typeof this.get('version') !== 'number')
            return this.warn('A version number is needed for this request.');
          appBefore.apply(this, arguments);
        },
        success: function(data) {
          this.update('snapshots', data);
          // this.update('isModified', null);
        },
        error: function(m, x, p) {
          if (+x.status === 401)
            this.dispatchEvent('requireLogin');
          else
            app.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'loadAllSnapshots',
        url: '/api/space/snapshot/:spaceId',
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        before: appBefore,
        success: function(data) {
          this.update('snapshots', data);
        },
        error: function(m, x, p) {
          if (+x.status === 401)
            this.dispatchEvent('requireLogin');
          else
            app.danger(i18n.t('errors.default'));
        }
      }
    ]
  });
}).call(this);
