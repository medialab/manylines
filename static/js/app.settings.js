;(function(undefined) {

  /**
   * Manylines Application Settings
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
      clone: false,
      mergeRequests: false,
      verbose: true,
      strict: true
    },

    // Internationalization options
    i18n: {
      lang: 'en',
      url: '/manylines/locales/__lng__/__ns__.json'
    },

    // Layout defaults
    forceAtlas2: {
      strongGravityMode: true,
      gravity: 0.05,
      scalingRatio: 10,
      slowDown: 2,
      barnesHutOptimize: false,
      nodesize: 'original'
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
      maxNodeSize: 8,
      defaultEdgeColor: '#ddd',
      defaultNodeColor: '#ccc',
      edgeColor: 'default',
      rescaleIgnoreSize: false,
      labelThreshold: 8,
      singleHover: true,
      zoomMin: 0.002,
      zoomMax: 2
    },

    // Slide rendering options
    slideSigma: {
      maxNodeSize: 3,
      minEdgeSize: 0.5,
      maxEdgeSize: 0.5
    },

    // Storage utilities
    storage: {
      key: 'app-current',
      corpora: 'manylines-corpora'
    },

    // Handlebars templates
    templates: {
      path: '/manylines/templates/',
      prefix: 'app',
      suffix: 'handlebars'
    },

    // Upload
    upload: {
      maxSize: 4500000
    }
  };
}).call(this);
