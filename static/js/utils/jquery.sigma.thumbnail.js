;(function($, undefined) {

  /**
   * A simple jQuery plugin to display custom sigma thumbnails.
   */
  var idx = -1;

  function Thumbnail(s, el, params) {
    var self = this,
        $el = $(el);

    // Properties
    this.renderer = null;

    // Methods
    this.init = function() {
      this.kill();

      // Do we want to map colors or just display a filter
      var c = params.category;
      if (c.noDisplay)
        return;

      this.renderer = s.addRenderer({
        prefix: s.cameras.staticCamera.readPrefix,
        type: 'thumbnail',
        camera: 'staticCamera',
        container: el,
        category: c,
        values: c.values.reduce(function(res, obj) {
          res[obj.id] = obj.color;
          return res;
        }, {}),
        filter: params.filter
      });

      this.renderer.resize();

      // WARNING:
      // If it does not work, use an iframe.
      // If it still does not work, use setTimeout.
      // If it still does not work, you're screwed.
      setTimeout(self.refresh.bind(self), 0);
      // self.refresh();
    };

    this.refresh = function() {
      var w = $el.width(),
          h = $el.height();

      sigma.middlewares.rescale.call(
        s,
        '',
        s.cameras.staticCamera.readPrefix,
        {
          width: w,
          height: h
        }
      );

      this.renderer.doRender();
    };

    this.kill = function() {
      if (this.renderer)
        s.killRenderer(this.renderer);
      this.renderer = null;
    };
  }

  $.fn.thumbnail = function(s, params) {
    return new Thumbnail(s, this[0], params);
  };
}).call(this, jQuery);
