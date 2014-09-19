;(function(undefined) {

  /**
   * Handlebars Helpers
   * ===================
   *
   * Compilation of handy handlebars helpers.
   */

  Handlebars.registerHelper('t', function(i18n_key) {
    var result = i18n.t(i18n_key);
    return new Handlebars.SafeString(result);
  });

  Handlebars.registerHelper('keysLength', function(obj) {
    return new Handlebars.SafeString(Object.keys(obj || {}).length + '');
  });

  Handlebars.registerHelper('basemap_categories', function(obj) {
    return new Handlebars.SafeString(i18n.t('graph.category', {
      count: Object.keys(obj || {}).length
    }));
  });

  Handlebars.registerHelper('multiply', function(a, b) {
    return new Handlebars.SafeString(a * b);
  });

  Handlebars.registerHelper('ifEquals', function(a, b, o) {
    return (a === b) ? o.fn(this) : o.inverse(this);
  });
}).call(this);
