;(function(undefined) {

  /**
   * TubeMyNet Narratives Pane
   * ==========================
   *
   * This pane enables the user to compose narratives around his/her graph.
   */

  app.panes.narratives = function() {
    var self = this;

    // Extending
    Pane.call(this,  {
      name: 'narratives'
    });
  }
}).call(this);
