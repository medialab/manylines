;(function() {
  'use strict';

  /**
   * Read URL:
   * *********
   * Pattern: /embed/#/:embedId/:viewId
   */
  var params = location.hash.replace(/^#\//, '').split('/'),
      graphId = params[0],
      viewId = params[1];

  // TODO
  // ****
  // The route /api/graph/:graphId does not exist yet.
  // Also, this is not the route that will be used eventually, but embeds are
  // not implemented yet.
  sigma.parsers.json('/api/snapshot/' + graphId, function(data) {
    var s,
        graph = data.graph,
        view = data.view || {};

    s = new sigma({
      container: 'graph-container'
    });

    // Read graph:
    s.graph.read(graph);

    // Check view's camera:
    if (view.camera)
      s.camera.goTo(view.camera);

    // Finally, refresh:
    s.refresh();
  });
}).call(this);
