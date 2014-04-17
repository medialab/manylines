;(function() {
  'use strict';

  domino.settings({
    displayTime: true,
    verbose: true,
    strict: true
  });

  if (!domino.struct.isValid('Config'))
    domino.struct.add({
      id: 'Space',
      struct: {
        id: 'string',
        email: '?string',
        graphs: [{
          metaId: 'string',
          id: 'string'
        }],
      }
    });

  if (!domino.struct.isValid('Graph'))
    domino.struct.add({
      id: 'Graph',
      struct: {
        id: '?string',
        nodes: 'array',
        edges: 'array'
      }
    });

  if (!domino.struct.isValid('Meta'))
    domino.struct.add({
      id: 'Meta',
      struct: 'object'
    });

  tbn.control = new domino({
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
        id: 'space',
        triggers: 'updateSpace',
        dispatch: 'spaceUpdated',
        description: 'The current space (basically the historic of some graphs and the related metadata objects).',
        type: '?Space',
        value: null
      },
      {
        id: 'graph',
        triggers: 'updateGraph',
        dispatch: 'graphUpdated',
        description: 'The current graph.',
        type: '?Graph',
        value: null
      },
      {
        id: 'meta',
        triggers: 'updateMeta',
        dispatch: 'metaUpdated',
        description: 'The current graph meta object.',
        type: '?Meta',
        value: null
      },

      /**
       * APP STATE:
       * **********
       */
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
       * URL Hash management:
       * ********************
       */
      {
        triggers: ['viewUpdated', 'spaceIdUpdated'],
        method: function(e) {
          var hash,
              spaceId = this.get('spaceId'),
              view = this.get('view');

          switch (view) {
            // Views without spaceId:
            case 'upload':
              hash = '#/upload';
              break;

            // Views with mandatory spaceId:
            case 'login':
            case 'scripts':
            case 'settings':
              if (!spaceId) {
                this.log('The space ID is missing. The view is set to "upload".');
                hash = '#/upload';
              } else {
                hash = '#/' + view + '/' + spaceId;
              }
              break;

            // Views with optional spaceId:
            case 'explore':
              if (!spaceId) {
                hash = '#/' + view;
              } else {
                hash = '#/' + view + '/' + spaceId;
              }
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
            // Views without spaceId:
            case 'upload':
              this.update('spaceId', null);
              break;

            // Specific "login" view case:
            case 'login':
              if (hash.length <= 1) {
                this.log('The space ID is missing. The view is set to "upload".');
                this.update('view', 'upload');
                this.update('spaceId', null);
              } else
                this.update('spaceId', hash[1]);
              break;

            case 'scripts':
            case 'settings':
              if (hash.length <= 1) {
                this.log('The space ID is missing. The view is set to "upload".');
                this.update('view', 'upload');
                this.update('spaceId', null);
              } else {
                if (!this.get('graph'))
                  this.request('loadLast');

                this.update('spaceId', hash[1]);
              }
              break;

            // Views with optional spaceId:
            case 'explore':
              if (hash.length <= 1) {
                if (!this.get('graph')) {
                  this.log('The space ID and graph are missing. The view is set to "upload".');
                  this.update('view', 'upload');
                }

                this.update('spaceId', null);
              } else {
                if (!this.get('graph'))
                  this.request('loadLast');

                this.update('spaceId', hash[1]);
              }
              break;

            // Default cases:
            default:
              this.update('view', 'upload');
              this.update('spaceId', null);
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
          var graph = e.data.graph;

          this.update('graph', graph);
          this.update('spaceId', null);
          this.update('isModified', {
            graph: true
          });
          this.update('view', 'explore');
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

            this.request('save', {
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
            this.request('getSpace');
        }
      },
      {
        triggers: ['updateGraph', 'updateMeta'],
        method: function(e) {
          var modified = this.get('isModified') || {};

          switch (e.type) {
            case 'updateGraph':
              modified.graph = true;
              break;
            case 'updateMeta':
              modified.meta = true;
              break;
          }

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
          var space = this.get('space') || {};
          space[e.data.key] = e.data.value;

          this.request('updateSpace', {
            data: space
          });
        }
      }
    ],
    services: [
      {
        id: 'login',
        url: '/api/login/:spaceId/:password',
        dataType: 'json',
        success: function(data) {
          var lastView = this.get('lastView');
          this.update('space', data);
          this.update('lastView', null);
          this.update('view', lastView || 'explore');
        },
        error: function(m, x, p) {
          if (x.status)
            tbn.info(i18n.t('errors.unauthorized'));
          else
            tbn.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'logout',
        url: '/api/logout/:spaceId',
        dataType: 'json',
        success: function(data) {
          this.update('spaceId', null);
          this.update('view', 'upload');
        },
        error: function(m, x, p) {
          tbn.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'save',
        url: '/api/graph/last/:spaceId',
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        success: function(data) {
          this.update('isModified', null)
        },
        error: function(m, x, p) {
          tbn.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'createSpace',
        url: '/api/space',
        dataType: 'json',
        type: 'POST',
        success: function(data) {
          this.update('spaceId', data.id);
          this.dispatchEvent('save');
        },
        error: function(m, x, p) {
          if (m === 'Invalid email')
            tbn.info(i18n.t('warnings.invalid_email'));
          else if (m === 'Invalid password')
            tbn.info(i18n.t('warnings.invalid_password'));
          else
            tbn.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'updateSpace',
        url: '/api/space/:spaceId',
        dataType: 'json',
        type: 'POST',
        success: function(data, input) {
          var space = this.get('space');
          space.email = data.email;
          this.update('space', space);
        },
        error: function(m, x, p) {
          if (m === 'Invalid email')
            tbn.info(i18n.t('warnings.invalid_email'));
          else if (m === 'Invalid password')
            tbn.info(i18n.t('warnings.invalid_password'));
          else if (+x.status === 401)
            this.dispatchEvent('requireLogin');
          else
            tbn.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'getSpace',
        url: '/api/space/:spaceId',
        dataType: 'json',
        type: 'GET',
        success: function(data) {
          this.update('space', data);
          this.update('spaceId', data.id);
        },
        error: function(m, x, p) {
          if (+x.status === 401)
            this.dispatchEvent('requireLogin');
          else
            tbn.danger(i18n.t('errors.default'));
        }
      },
      {
        id: 'loadLast',
        url: '/api/graph/last/:spaceId',
        dataType: 'json',
        success: function(data) {
          this.update('meta', data.meta);
          this.update('graph', data.graph);
          this.update('isModified', null);
        },
        error: function(m, x, p) {
          if (+x.status === 401)
            this.dispatchEvent('requireLogin');
          else
            tbn.danger(i18n.t('errors.default'));
        }
      }
    ]
  });
}).call(this);
