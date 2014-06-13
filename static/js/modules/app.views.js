;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.views = function(dom, d) {
    var self = this,
        sigmaController = new app.utils.sigmaController('views', dom, d);

    // Binding actions
    $('[data-app-view-action]', dom).click(function(e) {
      var action = $(this).attr('data-app-view-action');
      console.log(action);

      e.preventDefault();
    });

    this.kill = function() {
      sigmaController.killRenderer();
    };
  };
}).call(this);
