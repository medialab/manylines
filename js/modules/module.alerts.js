;(function(undefined) {

  /**
   * Manylines Alerts Module
   * ========================
   *
   * Display feeback on user's action through a fading banner.
   */

  app.modules.alerts = function() {
    var $container = $('#app-alerts-container'),
        self = this;

    function makeLevel(lvl) {
      return function(msg) {
        var d = $('<div class="alert alert-' + lvl + '">' + msg + '</div>').appendTo($container);
        setTimeout(function() {
          if ($container.has(d))
            d.fadeOut(300, function() { $(this).remove(); });
        }, app.settings.alertsDelay || 2000);
      };
    }

    ['success', 'info', 'warning', 'danger'].forEach(function(l) {
      self[l] = makeLevel(l);
    });

    function handle(d, e) {
      var c = {
        error: 'danger',
        warning: 'warning',
        info: 'info',
        success: 'success'
      };

      self[c[e.type]](i18n.t(e.data.reason));
    }

    // Receptor
    this.triggers.events['error'] = handle;
    this.triggers.events['warning'] = handle;
    this.triggers.events['info'] = handle;
    this.triggers.events['success'] = handle;
  };
}).call(this);
