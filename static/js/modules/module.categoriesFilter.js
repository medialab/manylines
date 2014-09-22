;(function(undefined) {

  /**
   * TubeMyNet Categories Filter Module
   * ===================================
   *
   * A simple submodule to plug when one needs to deal with categories and
   * a filter on their values.
   */

  app.modules.categoriesFilter = function(dom, parent) {
    var self = this,
        s = app.control.get('mainSigma');

    // Properties
    this.filter = new Filter();
    this.thumbnails = [];

    /**
     * Clicking on a category
     */
    dom.on('click', '.network-item', function(e) {
      var category = app.control.query(
        'nodeCategory',
        $(this).attr('data-app-thumbnail-category')
      );

      parent.openPanel('category', {category: category});
      self.filter.clear().set(category);
    });

    /**
     * Clicking on a category value
     */

    // TODO: DRY this up!
    dom.on('click', '.category-item', function(e) {
      var t = $(e.target),
          value,
          cat;
      t = t.hasClass('.category-item') ? t : t.parents('.category-item');

      // Retrieving needed data
      value = t.find('.cat-item-label').text(),
      cat = $('.network-item.active', dom).attr('data-app-thumbnail-category');

      // Updating classes
      t.toggleClass('active');

      // Adding or removing the value from the filter
      if (t.hasClass('active')) {
        self.filter.add(value);
        t.removeClass('cat-item-muted');
      }
      else {
        self.filter.remove(value);
        t.addClass('cat-item-muted');
      }

      // If no one has the active class anymore
      var nb_active = $('.category-item.active', dom).length;
      if (!nb_active) {
        $('.category-item', dom).removeClass('cat-item-muted');
      }
      else if (nb_active === 1){
        $('.category-item:not(.active)', dom).addClass('cat-item-muted');
      }

      // Highlighting graph accordingly
      s.run(
        'highlightCategoryValues',
        self.filter.category,
        self.filter.values
      );
    });

    /**
     * Clicking elsewhere would clear the filter's values.
     */
    dom.on('click', '.categories-container', function(e) {
      if (e.target !== this && !$(e.target).is('.title'))
        return;

      self.filter.empty();
      $('.category-item', dom).removeClass('cat-item-muted active');

      // Updating sigma
      s.run(
        'highlightCategoryValues',
        self.filter.category,
        self.filter.values
      );
    });


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
    this.triggers.events['meta.updated'] = this.renderCategories.bind(this);
    this.triggers.events['layout.stop'] = this.refreshThumbnails.bind(this);
    this.renderCategories();

    // On unmount
    this.unmount = function() {

      // Destroying thumbnails
      this.unmountThumbnails();
    };
  };
}).call(this);





