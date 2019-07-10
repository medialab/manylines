;(function(undefined) {

  /**
   * Manylines Graph Module
   * =======================
   *
   * A simple module to display the main graph of a given pane.
   */

  app.modules.graph = function(dom, params) {
    params = params || {};
    var self = this,
        s = app.control.get('mainSigma');

    // Replacing the graph container into the current view
    $('.sigma-expand').replaceWith(app.control.get('mainRendererContainer'));

    // Resizing the renderer
    s.renderers.main.resize();

    if (!params.snapshot) {

      // Rendering settings
      s.settings(app.settings.sigma);

      // Recentering camera
      s.cameras.main.goTo({x: 0, y: 0, ratio: 1, angle: 0});

      // Refreshing sigma and resetting colors
      s.run('resetColors');
    }
    else {
      var snapshot = params.snapshot,
          filter = snapshot.filters[0] || {};

      // Rendering settings
      s.settings(app.settings.slideSigma);

      // Hihglighting
      s.run(
        'highlightCategoryValues',
        app.control.query('nodeCategory', filter.category),
        filter.values
      );

      // Applying snapshot camera
      s.loadCamera('main', snapshot.view.camera);
    }

    /**
     * Zooming
     */
    $('*[data-app-sigma-action="zoom"]', dom).click(function() {
      var cam = s.cameras.main;

      sigma.misc.animation.camera(
        cam,
        { ratio: cam.ratio / 1.5 },
        { duration: 150 }
      );
    });

    /**
     * Unzooming
     */
    $('*[data-app-sigma-action="unzoom"]', dom).click(function() {
      var cam = s.cameras.main;

      sigma.misc.animation.camera(
        cam,
        { ratio: cam.ratio * 1.5 },
        { duration: 150 }
      );
    });

    /**
     * Recentering
     */
    $('*[data-app-sigma-action="recenter"]', dom).click(function() {
      var cam = s.cameras.main;

      sigma.misc.animation.camera(
        cam,
        params.snapshot ?
          s.retrieveCamera('main', params.snapshot.view.camera) :
          {x: 0, y: 0, angle: 0, ratio: 1},
        { duration: 150 }
      );
    });

    // Unmounting
    this.unmount = function() {
      var container = $('.sigma-panel')[0];

      // Unmounting graph renderer
      if (container)
        try {
          container.removeChild(app.control.get('mainRendererContainer'));
        } catch (e) {
          // pass...
        }
    };
  };
}).call(this);
