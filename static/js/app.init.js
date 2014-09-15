;(function() {
  'use strict';

  // DOM root:
  app.dom = app.dom || $('body');
  app.alertsDom = app.alertsDom || $('#app-alerts-container');

  // Load dictionary:
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

    // Instanciate layout:
    app.control.addModule(app.modules.layout, [app.control]);

    // Trigger init hack:
    app.control.dispatchEvent('init');
  });
}).call(this);
