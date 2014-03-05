;(function() {
  'use strict';

  var root = this;
  root.tbn = root.tbn || {};

  tbn.pkg = function(path) {
    return path.split('.').reduce(function(scope, objName) {
      return (scope[objName] = scope[objName] || {});
    }, root);
  };

  // Templates management:
  tbn.pkg('tbn.templates.preloaded');
  var _override = {},
      _templates = {},
      _prefix = 'templates/',
      _suffix = '.handlebars';

  function loadTemplate(path, callback) {
    if (!tbn.templates.get(path))
      $.ajax({
        url: _prefix + path + _suffix,
        success: function(data) {
          _templates[path] = Handlebars.compile(data);
          if (callback)
            callback(_templates[path]);
        }
      });
    else if (callback)
      callback(tbn.templates.get(path));
  }

  tbn.templates.require = function(v, callback) {
    var a,
        pendings;

    if (typeof v === 'string')
      loadTemplate(v, callback);
    else if (Array.isArray(v)) {
      if (typeof callback === 'function') {
        a = [];
        pendings = v.length;

        v.forEach(function(o, i) {
          loadTemplate(o, function(template) {
            a[i] = template;
            if (!(--pendings))
              callback(a);
          });
        });
      } else
        v.forEach(loadTemplate);
    }
  };

  tbn.templates.get = function(path) {
    return(
      // First, check overrides:
      _override[path] ||
      // Then, check preloaded templates:
      tbn.templates.preloaded[_prefix + path + _suffix] ||
      // If nothing has been found, check dynamic templates:
      _templates[path]
    );
  };

  tbn.templates.override = function(name, template) {
    _override[name] = template;
  };
}).call(this);
