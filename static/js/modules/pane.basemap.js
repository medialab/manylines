;(function(undefined) {

  /**
   * TubeMyNet Basemap Pane
   * =======================
   *
   * The basemap pane presents the graph in a simple fashion and enable you to
   * apply a layout and vizualise categories.
   */

  app.panes.basemap = function() {
    var self = this,
        s = app.control.get('mainSigma');

    // Extending
    Pane.call(this,  {
      name: 'basemap',
      graph: true
    });

    // Properties
    this.thumbnails = [];

    // Methods
    this.unmountThumbnails = function() {
      this.thumbnails.forEach(function(t) {
        t.unmount();
      });

      this.thumbnails = [];
    };

    this.refreshThumbnails = function() {
      s.refresh();
      this.thumbnails.forEach(function(t) {
        t.render();
      });
    };

    this.renderCategories = function() {
      var nodeModel = app.control.expand('nodeModel'),
          $container = $('.subcontainer-networklist');

      // Cleaning
      $container.empty();
      this.unmountThumbnails();

      // Retrieving template
      app.templates.require('misc.category', function(template) {

        nodeModel.forEach(function(cat) {
          if (cat.noDisplay)
            return;

          // Rendering
          var $el = $(template(cat));
          $container.append($el);

          // Instantiating thumbnails
          self.thumbnails.push(
            new Thumbnail($el.find('.network-thumbnail')[0], {category: cat})
          );
        });

        self.refreshThumbnails();
      });
    };

    // Receptors
    this.triggers.events.metaUpdated = this.renderCategories;

    // Initialization
    this.didRender = function() {
      this.renderCategories();
    }

    // On unmounting the pane
    this.willUnmount = function() {
      this.unmountThumbnails();
    };
  }
}).call(this);
