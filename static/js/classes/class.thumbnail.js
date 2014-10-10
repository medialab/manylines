;(function(undefined) {

  /**
   * Manylines Thumbnail Class
   * ==========================
   *
   * Abstraction used to build sigma thumbnail easily.
   */

  var cameraCounter = 0;

  this.Thumbnail = function(el, params) {
    params = params || {};

    var self = this,
        s = app.control.get('mainSigma');

    // Properties
    this.renderer = null;
    this.camera = null;

    // Methods
    this.render = function() {
      if (!this.renderer)
        return this;

      if (this.camera)
        s.loadCamera(this.camera.id, params.camera);

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
          filter: (params.filter || {}).values || [],
          camera: params.camera
        }
      });
    };

    // Initialization
    this.init();
  };
}).call(this);
