;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.views = function(dom, d) {
    var self = this,
        sigmaController = new app.utils.sigmaController('views', dom, d);

    this.kill = function() {
      sigmaController.killRenderer();
    };
  };
}).call(this);
