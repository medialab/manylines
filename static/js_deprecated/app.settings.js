;(function() {
  'use strict';

  var root = this;
  root.app = root.app || {};

  /**
   * TubeMyNet Settings:
   * *******************
   */
  app.settings = {
    alertsDelay: 2000,
    i18n: {
      lang: 'en',
      url: '/locales/__lng__/__ns__.json'
    },
    storageKey: 'app-current'
  };

  /**
   * TubeMyNet Defaults Parameters:
   * ******************************
   */
  app.defaults = {
    sigma: {
      hideEdgesOnMove: true,
      font: 'Roboto Condensed',
      fontStyle: '300',
      defaultLabelSize: 13,
      minEdgeSize: 1.5,
      maxEdgeSize: 1.5,
      defaultEdgeColor: '#ddd',
      defaultNodeColor: '#ccc',
      edgeColor: 'default',
      rescaleIgnoreSize: true,
      labelThreshold: 8,
      zoomMin: 0.002,
      zoomMax: 2
    },
    renderer: 'webgl',
    colors: {
      mutedBasis: 248,
      weakCategory: '#aaa'
    },
    forceAtlas2: {
      strongGravityMode: true,
      gravity: 0.05,
      scalingRatio: 10,
      slowDown: 2,
      nodesize: "degree"
    }
  };
}).call(this);
