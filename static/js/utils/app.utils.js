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

  // Helpers
  function muteColor(color) {
    var rgb = chroma(color).rgb(),
        m = app.defaults.colors.mutedBasis;

    // Chroma deals with the potentially negative numbers, no need to worry
    for (var i = 0; i < 3; i++)
      rgb[i] = m - 0.1 * (m - rgb[i]);

    return chroma.rgb(rgb).hex();
  }

  function clean(entity) {
    delete entity.hidden;
    delete entity.muted;
  }

  // Extending prototype
  sigma.prototype.getGraph = function() {
    return {
      nodes: this.graph.nodes(),
      edges: this.graph.edges()
    };
  };

  sigma.prototype.mapColors = function(cat) {
    var colors = cat ? cat.values.reduce(function(res, o) {
      res[o.id] = o.color;
      return res;
    }, {}) : null;

    var hasMuted = false;

    this.graph.nodes().forEach(function(n) {
      n.trueColor = n.trueColor || n.color;
      n.color = cat ? colors[n.attributes[cat.id]] : n.trueColor;

      if (n.muted !== undefined)
        hasMuted = true;

      clean(n);
    });

    if (hasMuted)
      this.graph.edges().forEach(clean);

    this.refresh();
  };

  sigma.prototype.mapSizes = function(option){
    switch(option){
      case "original":
        this.graph.nodes().forEach(function(n){
          n.size = n.trueSize;
        });
        break;

      case "degree":
        this.graph.nodes().forEach(function(n){
          n.size = 1 + 2 * Math.sqrt(this.graph.degree(n.id));
        }, this);
        break;

      case "indegree":
        this.graph.nodes().forEach(function(n){
          n.size = 1 + 2 * Math.sqrt(this.graph.degree(n.id, "in"));
        }, this);
        break;

      case "outdegree":
        this.graph.nodes().forEach(function(n){
          n.size = 1 + 2 * Math.sqrt(this.graph.degree(n.id, "out"));
        }, this);
        break;

    }
    this.refresh();
  }

  sigma.prototype.highlight = function(filter) {
    var cat = filter.category,
        values = filter.values,
        self = this;

    if (cat === undefined || !values.length)
      return this.mapColors(cat);

    var colors = cat ? cat.values.reduce(function(res, o) {
      res[o.id] = o.color;
      return res;
    }, {}) : null;

    // Iterating through nodes
    this.graph.nodes().forEach(function(n) {
      var muted = true;
      n.trueColor = n.trueColor || n.color;

      values.forEach(function(v) {
        if (n.attributes[cat.id] === v)
          muted = false;
      });

      // Updating color
      n.color = muted ?
        muteColor(colors[n.attributes[cat.id]]) :
        colors[n.attributes[cat.id]];

      // Flagging the node as muted or not
      n.muted = muted;
    });

    // Iterating through edges
    this.graph.edges().forEach(function(e) {
      if (self.graph.nodes(e.source).muted || self.graph.nodes(e.target).muted)
        e.hidden = true;
      else
        delete e.hidden;
    });

    // Refreshing sigma
    this.refresh();
  };

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
      type: app.defaults.renderer,
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
   * Useful classes:
   * ***************
   */
  function Filter(d) {

    // Properties
    this.values = [];
    this.category;

    // Methods
    this.set = function(category) {

      // Retrieving category from model
      ((d.get('meta').model || {}).node || []).some(function(o) {
        return o.id === category ? (category = o) : false;
      });

      this.category = category;
      return this;
    };

    this.add = function(value) {
      if (!~this.values.indexOf(value))
        this.values.push(value);
      return this;
    };

    this.remove = function(value) {
      this.values = this.values.filter(function(v) {
        return v !== value;
      });
      return this;
    };

    this.export = function() {
      return {
        category: this.category.id,
        values: this.values
      };
    }

    this.removeAll = function() {
      this.values = [];
      return this;
    };

    this.clear = function() {
      this.removeAll();
      this.category = undefined;
      return this;
    };
  }

  // Exporting
  app.classes = {
    filter: Filter
  };


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

  Handlebars.registerHelper('multiply', function(a, b) {
    return new Handlebars.SafeString(a * b);
  });

  Handlebars.registerHelper('ifEquals', function(a, b, o) {
    return (a === b) ? o.fn(this) : o.inverse(this);
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
