;(function(undefined) {

  /**
   * TubeMyNet Menu Module
   * ======================
   *
   * This modules enable menu interactions to change the application's pane.
   */

  app.modules.menu = function(d) {
    var dom = $('.nav-tmn-menu'),
        self = this;

    // Emitters
    dom.on('click', '[data-app-pane]:not(.active)', function() {
      self.dispatchEvent('menu.request', $(this).attr('data-app-pane'));
    });

    // Receptors
    this.triggers.events['pane.updated'] = function(d) {
      var newPane = d.get('pane');

      $('[data-app-pane]', dom).removeClass('active');
      $('[data-app-pane="' + newPane + '"]', dom).addClass('active');
    };
  };
}).call(this);
