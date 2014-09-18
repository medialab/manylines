;(function(undefined) {

  /**
   * TubeMyNet Application Initialization
   * =====================================
   *
   * Instantiating the controller and launching the application.
   */

  // Setup domino
  domino.settings(app.settings.domino);

  // Setup controller
  app.control = new domino({
    properties: app.properties,
    services: app.services
  });

  // Setup facets

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
      }
    }, function(err) {

      // Initialization went well, dispatching
      app.control.dispatchEvent('app.initialized');
    });
  };

  app.init();
}).call(this);
