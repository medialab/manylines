;(function(undefined) {

  /**
   * Manylines Application Initialization
   * =====================================
   *
   * Instantiating the controller and launching the application.
   */

  // Setup domino
  domino.settings(app.settings.domino);

  // Setup controller
  app.control = new domino({
    hacks: app.hacks,
    properties: app.properties,
    services: app.services,
    shortcuts: app.shortcuts
  });

  // Initialization routine
  app.init = function() {

    contra.series({

      // Retrieving i18n strings
      dictionary: function(next) {
        var settings = app.settings.i18n;

        i18n.init({
          lng: settings.lang,
          fallbackLng: settings.lang,
          resGetPath: settings.url,
          ns: {
            namespaces: ['translation'],
            defaultNs: 'translation'
          }
        }, function(t) {

          // Translate current dom
          $('body').i18n();
          next();
        });
      },

      // Sigma initialization
      sigma: function(next) {

        // Instantiating
        var s = new sigma({settings: app.settings.sigma});

        // Creating the main cameras
        s.addCamera('main');
        s.addCamera('static');

        // Creating the main renderer
        var container = document.createElement('div');
        container.setAttribute('class', 'sigma-expand');

        s.addRenderer({
          container: container,
          camera: 'main',
          type: app.settings.renderer,
          id: 'main'
        });

        // TODO: Clear that HACK
        // Fixes problem with sigma and window resizing
        window.addEventListener('resize', function() {
          window.setTimeout(s.refresh.bind(s), 0);
        });

        // Updating properties
        app.control.update({
          mainSigma: s,
          mainRendererContainer: container
        });

        next();
      },

      // Registering vital modules
      modules: function(next) {

        app.control.addModule(app.modules.alerts);
        app.control.addModule(app.modules.location);
        app.control.addModule(app.modules.layout);
        app.control.addModule(app.modules.menu);
        app.control.addModule(app.modules.status);
        app.control.addModule(app.modules.modals);
        app.control.addModule(app.modules.storage);

        next();
      },

      // Configuring model queries
      queries: function(next) {

        var index = {};
        app.queries.forEach(function(q) {
          index[q.id] = q.method;
        });

        app.control.query = function(id) {
          if (!(id in index))
            throw Error('app.control.query: inexistant query.');

          return index[id].apply(app.control, Array.prototype.slice.call(arguments, 1));
        };

        next();
      }
    }, function(err) {

      // Initialization went well, dispatching
      app.control.dispatchEvent('app.initialized');
    });
  };

  app.init();
}).call(this);
