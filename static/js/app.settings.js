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
      minEdgeSize: 0.1,
      maxEdgeSize: 0.4,
      defaultEdgeColor: '#ddd',
      defaultNodeColor: '#ccc',
      edgeColor: 'default',
      labelThreshold: 8
    },
    forceAtlas2: {
      strongGravityMode: true,
      gravity: 0.01,
      scalingRatio: 10
    }
  };
}).call(this);
