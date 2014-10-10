;(function(undefined) {

  /**
   * Manylines Snapshots Pane
   * =========================
   *
   * This pane enable you to take photographs of your graph in order to organize
   * them later into narratives.
   */

  app.panes.snapshots = function() {
    var self = this,
        s = app.control.get('mainSigma');

    // Extending
    Pane.call(this,  {
      name: 'snapshots',
      graph: true
    });

    // Properties
    this.categories = null;
    this.snapshotThumbnails = [];

    // Emitters
    this.emitters = function(dom) {

      // Registering children
      this.categories = this.addChildModule(app.modules.categoriesFilter, [dom]);

      /**
       * Taking a snapshot of the graph.
       */
      $('[data-app-snapshots-action="snapshot"]', dom).click(function(e) {

        // Dispatch event
        self.dispatchEvent('snapshot.take', {
          filter: self.categories.filter.export()
        });

        e.preventDefault();
      });

      /**
       * Clicking on a snapshot to re-apply it.
       */

      // TODO: do not execute if the view is already current?
      dom.on('click', '.views-band-container .view-item', function(e) {
        var $target = $(this).children('.view-thumbnail'),
            snapshotId = $target.attr('data-app-thumbnail-snapshot'),
            snapshot = app.control.query('snapshotById', snapshotId);

        // Updating camera
        s.loadCamera('main', snapshot.view.camera);

        // Closing panel
        self.closePanel();

        // Importing filter
        self.categories.filter.import({
          category: app.control.query('nodeCategory', (snapshot.filters[0] || {}).category),
          values: (snapshot.filters[0] || {}).values
        });

        // Opening relevant panel
        if (self.categories.filter.category)
          self.openPanel('misc.categoryPanel', {
            category: self.categories.filter.category
          });
      });
    };

    // Methods
    this.openPanel = function(path, options) {
      var dom = self.dom;

      // Retrieving template
      app.templates.require('misc.categoryPanel', function(template) {
        var panel;

        // Deactivation
        dom.find('*[data-app-snapshots-panel="sidebar"] .active')
          .removeClass('active');

        panel = $(template(options.category));
        $('.network-item[data-app-thumbnail-category="' + options.category.id + '"]', dom).addClass('active');

        // Events:
        $('.tirette', panel).click(function(e) {
          self.closePanel();
          e.preventDefault();
        });

        // Dealing with panel display
        dom.find('*[data-app-snapshots-panel="sigma"]').removeClass('col-xs-9').addClass('col-xs-6');
        dom.find('.col-middle').show().empty().append(panel);
        $('.forcelayout-container .tirette', dom).hide();

        if (self.categories.filter.values.length) {
          dom.find('.category-item').addClass('cat-item-muted');

          // Activating selected values
          self.categories.filter.values.forEach(function(v) {
            dom.find('.category-item[data-app-category-value="' + v + '"]')
               .addClass('active')
               .removeClass('cat-item-muted');
          });

          s.run('highlightCategoryValues', options.category, self.categories.filter.values);
        }
        else {
          s.run('mapColors', options.category);
        }

        // Resizing graph
        self.resizeGraph();
      });
    };

    this.closePanel = function() {
      var dom = this.dom;

      dom.find('*[data-app-snapshots-panel="sidebar"]').find('.active').removeClass('active');
      dom.find('*[data-app-snapshots-panel="sigma"]').removeClass('col-xs-6').addClass('col-xs-9');
      dom.find('.col-middle').empty().hide();

      // Resising graph and resetting it
      this.resizeGraph();
      s.run('resetColors');

      // TODO: do it elsewhere
      self.categories.filter.clear();
    };

    this.resizeGraph = function() {
      s.renderers.main.resize();
      s.renderers.main.render();
    };

    this.renderSnapshots = function() {
      var $container = $('.views-band');

      // Cleaning
      this.unmountSnapshotThumbnails();

      // Templating
      app.templates.require('misc.snapshot', function(template) {
        var snapshots = app.control.get('snapshots');

        $container.empty();
        snapshots.forEach(function(snapshot) {
          var $el = $(template(snapshot));
          $container.append($el);

          var filter = (snapshot.filters || [])[0],
              category = app.control.query('nodeCategory', (filter || {}).category);

          self.snapshotThumbnails.push(
            new Thumbnail(
              $el.find('.view-thumbnail')[0],
              {
                category: category,
                camera: snapshot.view.camera,
                filter: filter
              }
            )
          );
        });

        self.refreshSnapshotTumbnails();
      });
    };

    this.refreshSnapshotTumbnails = function() {
      s.refresh();
      this.snapshotThumbnails.forEach(function(t) {
        t.render();
      });
    };

    this.unmountSnapshotThumbnails = function() {
      this.snapshotThumbnails.forEach(function(t) {
        t.unmount();
      });

      this.snapshotThumbnails = [];
    };


    // Initialization
    this.didRender = function() {
      this.renderSnapshots();
    };

    // Receptors
    this.triggers.events['snapshots.updated'] = function() {
      if (!self.rendered)
        return;

      self.renderSnapshots();
    }

    // On unmount
    this.willUnmount = function() {
      this.unmountSnapshotThumbnails();
    };
  };
}).call(this);
