;(function(undefined) {

  /**
   * TubeMyNet Thumbnail Class
   * ==========================
   *
   * Abstraction used to build sigma thumbnail easily.
   */

  var cameraCounter = 0;

  this.Thumbnail = function(el, params) {
    var self = this,
        s = app.control.get('mainSigma');

    // Properties
    this.renderer = null;
    this.camera = null;

    // Methods
    this.render = function() {
      if (!this.renderer)
        return this;

      this.renderer.render({process: true});
      return this;
    };

    this.unmount = function() {

      // Killing the thumbnail's renderer
      if (this.renderer)
        s.killRenderer(this.renderer);
      this.renderer = null;

      // Killing the thumbnail's camera
      if (this.camera)
        s.killCamera(this.camera);
      this.camera = null;
    };

    this.init = function() {
      var cat = params.category || {};

      // This should not happen here
      if (cat.noDisplay)
        return;

      // Is a custom camera needed?
      if (params.camera) {
        this.camera = s.addCamera('thumbnail' + (cameraCounter++));

        // Applying camera
        // TODO: use custom method to do something nice when we have
        // the formula
        this.camera.goTo({
          ratio: params.camera.ratio,
          x: (params.camera.x * $el.width()) / 100,
          y: (params.camera.y * $el.height()) / 100
        });
      }

      // Adding a thumbnail renderer
      this.renderer = s.addRenderer({
        type: 'thumbnail',
        camera: this.camera ? this.camera.id : 'static',
        container: el,
        data: {
          category: cat,
          values: (cat.values || []).reduce(function(res, obj) {
            res[obj.id] = obj.color;
            return res;
          }, {}),
          filter: params.filter,
          camera: params.camera
        }
      });
    };

    // Initialization
    this.init();
  };
}).call(this);
