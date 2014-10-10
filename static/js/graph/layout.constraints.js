;(function(undefined) {

  /**
   * Manylines Layout Constraints
   * =============================
   *
   * Methods to apply on a given layout settings to ensure some best practices
   * are enforced.
   */
  app.graph.layoutConstraints = function(layout) {
    if (layout.linLogMode) {
      layout.strongGravityMode = false;
      layout.scalingRatio = 0.2;
      layout.slowDown = 1;
    }
    else {
      layout.strongGravityMode = true;
      layout.scalingRatio = 10;
      layout.slowDown = 2;
    }

    return layout;
  };
}).call(this);
