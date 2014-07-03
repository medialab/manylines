;(function($, undefined) {

  /**
   * A simple jQuery plugin to display custom sigma thumbnails.
   */
  function Thumbnail(s, el, params) {
    var self = this,
        $el = $(el);

    // Properties
    this.renderer = null;

    // Methods
    // TODO: autoInit?
    this.init = function() {
      this.kill();

      // Do we want to map colors or just display a filter
      var c = params.category;
      if (c.noDisplay)
        return;

      this.renderer = s.addRenderer({
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

      // Refreshing sigma instance to take renderer into account
      s.refresh();
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
