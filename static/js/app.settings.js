;(function() {
  'use strict';

  var root = this;
  root.app = root.app || {};

  /**
   * TubeMyNet Generic Settings:
   * ****************************
   */
  app.defaults = {
    sigma: {
      font: 'Roboto Condensed',
      fontStyle: '300',
      defaultLabelSize: 13,
      minEdgeSize: 1.5,
      maxEdgeSize: 1.5,
      defaultEdgeColor: '#ddd',
      defaultNodeColor: '#ccc',
      edgeColor: 'default',
      labelThreshold: 8,
      zoomMin: 0.002,
      zoomMax: 2
    },
    forceAtlas2: {
      strongGravityMode: true,
      gravity: 0.05,
      scalingRatio: 10,
      slowDown: 2
    }
  };
}).call(this);
