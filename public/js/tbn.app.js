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
        id: 'string',
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
        id: 'space',
        triggers: 'updateSpace',
        dispatch: 'spaceUpdated',
        description: 'The current space (basically the historic of some graphs and the related metadata objects).',
        type: '?Space'
      },
      {
        id: 'graph',
        triggers: 'updateGraph',
        dispatch: 'graphUpdated',
        description: 'The current graph.',
        type: '?Graph'
      },
      {
        id: 'graphMeta',
        triggers: 'updateGraphMeta',
        dispatch: 'graphMetaUpdated',
        description: 'The current graph meta object.',
        type: '?GraphMeta'
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
        type: 'string'
      }
    ],
    hacks: [
      /**
       * HREF management:
       * ****************
       */
      {
        triggers: ['viewUpdated'],
        method: function(e) {
          var hash,
              view = this.get('view');

          switch (view) {
            case 'upload':
              hash = '#/upload';
              break;

            case 'explore':
              hash = '#/explore';
              break;

            case 'settings':
              hash = '#/settings';
              break;

            case 'scripts':
              hash = '#/scripts';
              break;

            case 'login':
              hash = '#/login';
              break;
          }

          // Effectively update the hash:
          if (hash)
            this.dispatchEvent('updateHash', {
              hash: hash
            });
          else
            this.die('Invalid state.');
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
        }
      }
    ],
    services: [
      {
        id: 'getSpace',
        url: '/api/space/'
      }
    ]
  });
}).call(this);
