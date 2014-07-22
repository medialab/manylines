;(function($, undefined) {

  var cameraCounter = 0;

  /**
   * A simple jQuery plugin to display custom sigma thumbnails.
   */
  function Thumbnail(s, el, params) {
    var self = this,
        $el = $(el);

    // Properties
    this.renderer = null;
    this.camera = null;

    // Methods
    this.init = function() {
      this.kill();

      // Do we want to map colors or just display a filter
      var c = params.category;
      if (c.noDisplay)
        return;

      // Do we need to add a camera?
      if (params.camera) {
        this.camera = s.addCamera('thumbnailCamera' + (cameraCounter++));
        this.camera.goTo({
          ratio: params.camera.ratio,
          x: (params.camera.x * ($el.width() / 2)) / 100,
          y: (params.camera.y * ($el.height() / 2)) / 100
        });
      }

      this.renderer = s.addRenderer({
        type: 'thumbnail',
        camera: this.camera ? this.camera.id : 'staticCamera',
        container: el,
        data: {
          category: c,
          values: c.values.reduce(function(res, obj) {
            res[obj.id] = obj.color;
            return res;
          }, {}),
          filter: params.filter,
          camera: params.camera
        }
      });
    };

    this.refresh = function() {
      this.renderer.render({process: true});
      return this;
    };

    this.kill = function() {

      // Killing the thumbnail's renderer
      if (this.renderer)
        s.killRenderer(this.renderer);
      this.renderer = null;

      // Killing the thumbnail's camera
      if (this.camera)
        s.killCamera(this.camera.id);
      this.camera = null;
    };

    // Running initialization routine
    this.init();
  }

  $.fn.thumbnail = function(s, params) {
    return new Thumbnail(s, this[0], params);
  };
}).call(this, jQuery);
