;(function(undefined) {

  /**
   * TubeMyNet Basemap Pane
   * =======================
   *
   * The basemap pane presents the graph in a simple fashion and enable you to
   * apply a layout and vizualise categories.
   */

  app.panes.basemap = function() {
    var self = this;

    // Extending
    Pane.call(this,  {
      name: 'basemap',
      graph: true
    });
  }
}).call(this);
