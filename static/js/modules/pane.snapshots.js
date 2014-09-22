;(function(undefined) {

  /**
   * TubeMyNet Snapshots Pane
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

        s.run('mapColors', options.category);

        // Events:
        $('.tirette', panel).click(function(e) {
          self.closePanel();
          e.preventDefault();
        });

        // Dealing with panel display
        dom.find('*[data-app-snapshots-panel="sigma"]').removeClass('col-xs-9').addClass('col-xs-6');
        dom.find('.col-middle').show().empty().append(panel);
        $('.forcelayout-container .tirette', dom).hide();

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
    };

    this.resizeGraph = function() {
      s.renderers.main.resize();
      s.renderers.main.render();
    };
  };
}).call(this);
