;(function(undefined) {

  /**
   * TubeMyNet Application Settings
   * ===============================
   *
   * Generic options concerning graph rendering, graph layout and so on...
   */
  app.settings = {

    // Options concerning the alerting system
    alerts: {
      delay: 2000
    },

    // Misc defaults concerning colors
    colors: {
      mutedBasis: 248,
      weakCategory: '#aaa'
    },

    // Domino global settings
    domino: {
      displayTime: true,
      verbose: true,
      strict: true
    },

    // Internationalization options
    i18n: {
      lang: 'en',
      url: '/locales/__lng__/__ns__.json'
    },

    // Layout defaults
    forceAtlas2: {
      strongGravityMode: true,
      gravity: 0.05,
      scalingRatio: 10,
      slowDown: 2,
      nodesize: "degree"
    },

    // Renderer to use by default for the main graph
    renderer: 'webgl',

    // Default graph rendering options
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

    // Storage utilities
    storage: {
      key: 'app-current'
    },

    // Handlebars templates
    templates: {
      path: '/templates/',
      prefix: 'app',
      suffix: 'handlebars'
    }
  };
}).call(this);
