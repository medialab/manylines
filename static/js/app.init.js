;(function() {
  'use strict';

  // DOM root:
  app.dom = app.dom || $('body');
  app.alertsDom = app.alertsDom || $('#app-alerts-container');

  // Default configuration:
  app.pkg('blf');
  app.config = app.config || {};
  app.config.i18n = app.config.i18n || {};
  app.config.lang = app.config.lang || 'en';
  app.config.i18nURL = app.config.i18nURL || '/locales/__lng__/__ns__.json'

  // Load dictionary:
  i18n.init({
    lng: app.config.lang,
    fallbackLng: app.config.lang,
    resGetPath: app.config.i18nURL,
    ns: {
      namespaces: ['translation'],
      defaultNs: 'translation'
    }
  }, function(t) {
    // Translate DOM:
    app.dom.i18n();

    // Instanciate layout:
    app.control.addModule(app.modules.layout, [app.control]);

    // Trigger init hack:
    app.control.dispatchEvent('init');
  });
}).call(this);
