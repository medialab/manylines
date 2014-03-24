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

  if (!domino.struct.isValid('GraphMeta'))
    domino.struct.add({
      id: 'GraphMeta',
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
        id: 'graphMeta',
        triggers: 'updateGraphMeta',
        dispatch: 'graphMetaUpdated',
        description: 'The current graph meta object.',
        type: '?GraphMeta',
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
                debugger;
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

          // Check view:
          view = view || 'upload';
          this.update('view', view);

          switch (view) {
            // Views without spaceId:
            case 'upload':
              this.update('spaceId', null);
              break;

            // Views with mandatory spaceId:
            case 'login':
            case 'scripts':
            case 'settings':
              if (hash.length <= 1) {
                this.log('The space ID is missing. The view is set to "upload".');
                this.update('view', 'upload');
                this.update('spaceId', null);
              } else {
                this.update('spaceId', hash[1]);
              }
              break;

            // Views with optional spaceId:
            case 'explore':
              if (hash.length <= 1) {
                this.update('spaceId', null);
              } else {
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
          this.update('view', 'explore');
        }
      },
      {
        triggers: 'save',
        method: function(e) {
          var modified = this.get('isModified');

          if (Object.keys(modified || {}).length) {
            var k,
                data = {};

            for (k in modified)
              data[k] = this.get(k);

            // TODO:
            // Deal with space creation here
            return;
            if (data)
              this.request('save', data);
          }
        }
      },
      {
        triggers: ['graphUpdated', 'graphMetaUpdated'],
        method: function(e) {
          var modified = this.get('isModified') || {};

          switch (e.type) {
            case 'graphUpdated':
              modified.graph = true;
              break;
            case 'graphMetaUpdated':
              modified.graphMeta = true;
              break;
          }

          this.update('isModified', modified);
        }
      }
    ],
    services: [
      {
        id: 'login',
        url: '/api/login/:spaceId/:password',
        success: function(data) {
          this.update('space', data);
          this.update('view', 'explore');
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
        success: function(data) {
          this.update('spaceId', null);
          this.update('view', 'upload');
        },
        error: function(m, x, p) {
          tbn.error(i18n.t('errors.default'));
        }
      },
      {
        id: 'save',
        url: '/graph/last/:spaceId',
        success: function(data) {
          this.update('spaceId', null);
          this.update('isModified', null)
        },
        error: function(m, x, p) {
          tbn.error(i18n.t('errors.default'));
        }
      },
      {
        id: 'createSpace',
        url: '/api/space/:email/:password',
        success: function(data) {
          this.update('spaceId', data.id);
        },
        error: function(m, x, p) {
          tbn.error(i18n.t('errors.default'));
        }
      }
    ]
  });
}).call(this);
