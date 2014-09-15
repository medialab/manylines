;(function() {
  'use strict';

  // DOM root:
  app.dom = app.dom || $('body');
  app.alertsDom = app.alertsDom || $('#app-alerts-container');

  // Load dictionary:
  function loadDictionary(next) {
    i18n.init({
      lng: app.settings.i18n.lang,
      fallbackLng: app.settings.i18n.lang,
      resGetPath: app.settings.i18n.url,
      ns: {
        namespaces: ['translation'],
        defaultNs: 'translation'
      }
    }, function(t) {

      // Translate DOM:
      app.dom.i18n();
      next();
    });
  }

  // Layout
  function layout(next) {

    // Instanciate layout:
    app.control.addModule(app.modules.layout, [app.control]);
    next();
  }

  app.init = function() {

    // Triggering series of asynchronous initialization prerequisistes
    contra.series([
      loadDictionary,
      layout
    ], function(err) {

      // Trigger init hack:
      app.control.log('App initialization.');
      app.control.dispatchEvent('init');
    });
  };

  // Launching application
  app.init();
}).call(this);
