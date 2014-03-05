;(function(config) {
  'use strict';

  // Default configuration:
  tbn.pkg('blf');
  config = config || {};
  config.i18n = config.i18n || {};
  config.lang = config.lang || 'en';
  config.baseDOM = config.baseDOM || $('body');

  // Load dictionary:
  i18n.init({
    lng: config.lang,
    fallbackLng: config.lang,
    resGetPath: config.i18n.url,
    ns: {
      namespaces: ['translation'],
      defaultNs: 'translation'
    }
  }, function(t) {
    config.baseDOM.i18n();
  });
}).call(this);
