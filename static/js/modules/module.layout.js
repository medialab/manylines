;(function(undefined) {

  /**
   * TubeMyNet Layout Module
   * ========================
   *
   * This module updates the viewed pane and register/kill relevant modules
   * to achieve this goal.
   */

  app.modules.layout = function() {
    var self = this;

    // Properties
    this.currentPane = null;

    // Listening pane changes
    this.triggers.events['pane.updated'] = function(d, e) {
      var newPane = d.get('pane');

      // Removing old one
      if (self.currentPane) {
        self.currentPane.unmount && self.currentPane.unmount();
        app.control.killModule(self.currentPane)
      }

      // Displaying new one
      self.currentPane = app.control.addModule(app.panes[newPane]);
      self.currentPane.mount();
    };
  };
}).call(this);
