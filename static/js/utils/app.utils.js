;(function() {
  'use strict';

  var root = this;
  root.app = root.app || {};

  app.pkg = function(path) {
    return path.split('.').reduce(function(scope, objName) {
      return (scope[objName] = scope[objName] || {});
    }, root);
  };

  /**
   * Generic utils:
   * ***************
   */

  function isPlainObject(v) {
    return v instanceof Object &&
           !(v instanceof Array) &&
           !(v instanceof Function);
  }

  function extend() {
    var i,
        k,
        res = {},
        l = arguments.length;

    for (i = l - 1; i >= 0; i--)
      for (k in arguments[i])
        if (res[k] && isPlainObject(arguments[i][k]))
          res[k] = extend(arguments[i][k], res[k]);
        else
          res[k] = arguments[i][k];

    return res;
  }

  app.utils = {
    extend: extend
  };

  /**
   * Sigma utils:
   * ************
   */
  sigma.prototype.getGraph = function() {
    return {
      nodes: this.graph.nodes(),
      edges: this.graph.edges()
    };
  };

  // TODO: handler thumbnails here by Jove!
  // TODO: find better naming. This sucks hard.
  app.utils.sigmaController = function(name, dom, d) {
    var self = this,
        s = d.get('mainSigma');

    // Properties
    this.name = name;
    this.rendererName = 'tubemynet-' + this.name;
    this.instance = s;
    this.renderer = s.addRenderer({
      container: $('.sigma-panel .sigma-expand', dom)[0],
      camera: 'mainCamera',
      id: this.rendererName
    });

    // Refreshing sigma
    s.refresh();

    // Methods
    this.killRenderer = function() {
      s.killRenderer(this.rendererName);
    };

    // Bind sigma buttons:
    $('*[data-app-sigma-action="zoom"]', dom).click(function() {
      var cam = s.cameras.mainCamera;

      sigma.misc.animation.camera(
        cam,
        { ratio: cam.ratio / 1.5 },
        { duration: 150 }
      );
    });
    $('*[data-app-sigma-action="unzoom"]', dom).click(function() {
      var cam = s.cameras.mainCamera;

      sigma.misc.animation.camera(
        cam,
        { ratio: cam.ratio * 1.5 },
        { duration: 150 }
      );
    });
    $('*[data-app-sigma-action="recenter"]', dom).click(function() {
      var cam = s.cameras.mainCamera;

      sigma.misc.animation.camera(
        cam,
        { x: 0,
          y: 0,
          angle: 0,
          ratio: 1 },
        { duration: 150 }
      );
    });

    // Specify for layout:
    app.modules[name].sigmaLayout = true;
  }


  /**
   * Handlebars helpers:
   * *******************
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


  /**
   * Templates management:
   * *********************
   */
  app.pkg('app.templates.preloaded');
  var _override = {},
      _templates = {},
      _prefix = '/templates/',
      _suffix = '.handlebars';

  function loadTemplate(path, callback) {
    if (!app.templates.get(path))
      $.ajax({
        url: _prefix + path + _suffix,
        success: function(data) {
          _templates[path] = Handlebars.compile(data);
          if (callback)
            callback(_templates[path]);
        }
      });
    else if (callback)
      callback(app.templates.get(path));
  }

  app.templates.require = function(v, callback) {
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

  app.templates.get = function(path) {
    return(
      // First, check overrides:
      _override[path] ||
      // Then, check preloaded templates:
      app.templates.preloaded[_prefix + path + _suffix] ||
      // If nothing has been found, check dynamic templates:
      _templates[path]
    );
  };

  app.templates.override = function(name, template) {
    _override[name] = template;
  };


  /**
   * Alert utils:
   * ************
   */
  var currentAlerts = {};
  app.success = function(msg) {
    var d = $('<div class="alert alert-success">' + msg + '</div>').appendTo(app.alertsDom);
    setTimeout(function() {
      if (app.alertsDom.has(d))
        d.fadeOut(300, function() { $(this).remove(); });
    }, app.config.alertsDelay || 2000);
  };

  app.info = function(msg) {
    var d = $('<div class="alert alert-info">' + msg + '</div>').appendTo(app.alertsDom);
    setTimeout(function() {
      if (app.alertsDom.has(d))
        d.fadeOut(300, function() { $(this).remove(); });
    }, app.config.alertsDelay || 2000);
  };

  app.warning = function(msg) {
    var d = $('<div class="alert alert-warning">' + msg + '</div>').appendTo(app.alertsDom);
    setTimeout(function() {
      if (app.alertsDom.has(d))
        d.fadeOut(300, function() { $(this).remove(); });
    }, app.config.alertsDelay || 2000);
  };

  app.danger = function(msg) {
    var d = $('<div class="alert alert-danger">' + msg + '</div>').appendTo(app.alertsDom);
    setTimeout(function() {
      if (app.alertsDom.has(d))
        d.fadeOut(300, function() { $(this).remove(); });
    }, app.config.alertsDelay || 2000);
  };
}).call(this);
