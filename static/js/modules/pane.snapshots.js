;(function(undefined) {

  /**
   * TubeMyNet Snapshots Pane
   * =========================
   *
   * This pane enable you to take photographs of your graph in order to organize
   * them later into narratives.
   */

  app.panes.snapshots = function() {
    var self = this;

    // Extending
    Pane.call(this,  {
      name: 'snapshots',
      graph: true
    });
  }
}).call(this);
