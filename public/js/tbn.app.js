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

          tbn.dom.attr('data-tbn-view', view);

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
       * Graph uploading:
       * ****************
       */
      {
        triggers: 'graphUploaded',
        method: function(e) {
          var graph = e.data.graph;

          this.update('graph', graph);
          this.update('spaceId', null);
          this.update('view', 'explore');
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
          // TODO
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
          // TODO
        }
      }
    ]
  });
}).call(this);
