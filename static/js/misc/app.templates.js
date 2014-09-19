;(function(undefined) {

  /**
   * TubeMyNet Template engine
   * ==========================
   *
   * Simple helpers to retrieve the application templates.
   */

  // Abstract
  function Templates(settings) {
    var self = this;

    // Properties
    this.cache = {};

    // Utilities
    function getTemplate(name, callback) {
      if (self.cache[name])
        return callback(null, self.cache[name]);

      var url = settings.path + settings.prefix + '.' +
                name + '.' + settings.suffix;

      $.get(url, function(data) {

        // Compiling
        var template = Handlebars.compile(data);

        // Caching
        self.cache[name] = template;
        callback(null, template);
      });
    }

    // Methods
    this.require = function(name, callback) {
      name = typeof name === 'string' ? [name] : name;

      // Creating tasks
      var tasks = {};
      name.forEach(function(n) {
        tasks[n] = function(next) {
          getTemplate(n, next);
        };
      });

      // Launching tasks
      contra.concurrent(tasks, function(err, templates) {
        if (Object.keys(templates).length === 1)
          callback(templates[Object.keys(templates)[0]]);
        else
          callback(templates);
      });
    };
  }

  // Exporting
  app.templates = new Templates(app.settings.templates);
}).call(this);
