;(function() {
  'use strict';

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
  var tbnBefore = function() {
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
        id: 'view',
        triggers: 'updateView',
        dispatch: 'viewUpdated',
        description: 'The current view. Available values: "explore", "settings", "scripts", "upload", "login"',
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
        triggers: 'loadHash',
        method: function() {
          // Basically, what we need here is to retrieve app state from
          // the HASH and data from the STORAGE. But it has to happen at
          // once, to avoid side effect with the hacks bound on state events.
          // if (this.get('initialized'))
          //   return;

          // Read URL hash:
          this.dispatchEvent('hashUpdated', {
            hash: window.location.hash
          });
        }
      },
      {
        triggers: 'loadWebStorage',
        method: function() {
          if (this.get('initialized'))
            return;

          // Load localStorage:
          if (app.support.webStorage)
            this.dispatchEvent('loadLocalStorage');
          else
            this.dispatchEvent('initialUpdate');
        }
      },
      {
        triggers: 'initialUpdate',
        method: function(e) {
          if (this.get('initialized'))
            return;

          var data = e.data || {};

          if (Object.keys(data).length)
            this.update(data);

          // Finally unleash the features:
          this.update('initialized', true);

          // Load the data if not done yet:
          if (
            this.get('spaceId') &&
            this.get('view') !== 'login' &&
            !data.graph
          )
            this.request('loadGraphData');

          this.dispatchEvent('loadHash');
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
            case 'scripts':
            case 'settings':
            case 'explore':
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
            case 'scripts':
            case 'settings':
            case 'explore':
              if (hash.length <= 2) {
                if (!this.get('graph')) {
                  this.log('The space ID and graph are missing. The view is set to "upload".');
                  this.update('view', 'upload');
                }

                this.update('spaceId', null);
                this.update('version', null);
              } else {
                if (!this.get('graph'))
                  this.request('loadGraphData');

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

          this.update({
            graph: graph,
            meta: meta,
            view: 'explore',
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

            if (typeof this.get('version') !== 'number')
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
        triggers: 'spaceIdUpdated',
        method: function(e) {
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
        before: tbnBefore,
        success: function(data) {
          var lastView = this.get('lastView');
          this.update('space', data);
          this.update('lastView', null);
          this.update('view', lastView || 'explore');
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
        before: tbnBefore,
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
        before: tbnBefore,
        success: function(data) {
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
        before: tbnBefore,
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
        before: tbnBefore,
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
        before: tbnBefore,
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
        before: tbnBefore,
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
          tbnBefore.apply(this, arguments);
        },
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
        id: 'saveGraphData',
        url: '/api/space/graph/:spaceId/:version',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        before: function() {
          if (typeof this.get('version') !== 'number')
            return this.warn('A version number is needed for this request.');
          tbnBefore.apply(this, arguments);
        },
        success: function(data) {
          this.update('isModified', null)
        },
        error: function(m, x, p) {
          app.danger(i18n.t('errors.default'));
        }
      }
    ]
  });
}).call(this);
