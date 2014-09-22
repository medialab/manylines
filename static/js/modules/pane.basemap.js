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

    // Emitters
    this.emitters = function(dom) {

      // Binding children
      this.addChildModule(app.modules.forceAtlas, [dom]);
      this.addChildModule(app.modules.categoriesFilter, [dom]);

      /**
       * Opening the layout panel
       */
      $('.forcelayout-container .tirette', dom).click(function(e) {
        self.openPanel('force');
        e.preventDefault();
      });

      /**
       * Blurring inputs on keypress
       */
      dom.on('keypress', '*[data-app-basemap-layout-option]', function(e) {

        // TODO: switch to sub module
        if (e.which === 13) {
          $(this).blur();
        }
      });


      /**
       * Changing node sizes
       */
      dom.on('change', '*[data-app-basemap-layout-nodesize]', function(e){
        var value = $(this).attr('data-app-basemap-layout-nodesize');

        s.run('mapSizes', value);

        // TODO: switch to sub module
      });
    };

    // TODO: this is messy, find a more suited way
    this.openPanel = function(kind, options) {
      var path = kind === 'force' ? 'basemap.forcePanel' : 'misc.categoryPanel',
          dom = self.dom;

      // Retrieving template
      app.templates.require(path, function(template) {
        var panel;

        // Deactivation
        dom.find('*[data-app-basemap-panel="sidebar"] .active')
          .removeClass('active');

        // Custom templating
        if (kind === 'force') {
          panel = $(template(app.control.expand('forceAtlasConfig')));
          $('.forcelayout-container', dom).addClass('active');
        }
        else {
          panel = $(template(options.category));
          $('.network-item[data-app-thumbnail-category="' + options.category.id + '"]', dom).addClass('active');

          s.run('mapColors', options.category);
        }

        // Events:
        $('.tirette', panel).click(function(e) {
          self.closePanel();
          e.preventDefault();
        });

        // Dealing with panel display
        dom.find('*[data-app-basemap-panel="sigma"]').removeClass('col-xs-9').addClass('col-xs-6');
        dom.find('.col-middle').show().empty().append(panel);
        $('.forcelayout-container .tirette', dom).hide();

        // Resizing graph
        self.resizeGraph();
      });
    };

    this.closePanel = function() {
      var dom = this.dom;

      dom.find('*[data-app-basemap-panel="sidebar"]').find('.active').removeClass('active');
      dom.find('*[data-app-basemap-panel="sigma"]').removeClass('col-xs-6').addClass('col-xs-9');
      dom.find('.col-middle').empty().hide();
      $('.forcelayout-container .tirette', dom).show();

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
