;(function(undefined) {

  /**
   * TubeMyNet status Module
   * ========================
   *
   * This modules tracks the modification status of the current space
   * and informs the user accordingly.
   */

  app.modules.status = function(d) {
    var dom = $('.save > a'),
        self = this;

    // Initial state
    dom.hide();

    // Emitters
    dom.click(function() {
      self.dispatchEvent('save');
    });

    // Receptors
    this.triggers.events['modified.updated'] = function(d) {
      if (d.expand('isModified'))
        dom.show();
      else
        dom.hide();
    };
  };
}).call(this);
