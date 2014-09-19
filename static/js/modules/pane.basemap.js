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
    this.openedPanel = null;

    // Emitters
    this.emitters = function(dom) {

      /**
       * Opening the layout panel
       */
      $('.forcelayout-container .tirette', dom).click(function(e) {
        self.openPanel('force');
        e.preventDefault();
      });

      /**
       * Starting layout
       */
      dom.on('click', '*[data-app-basemap-action="startLayout"]', function(e) {
        $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'on');
        var settings = app.control.expand('forceAtlasConfig');

        // Opening panel if needed
        self.openPanel('force');

        // Configuring and starting ForceAtlas2
        s.configForceAtlas2(settings);
        s.startForceAtlas2();

        e.preventDefault();

        // Dispatching
        self.dispatchEvent('layout.start');
      });

      /**
       * Stopping layout
       */
      dom.on('click', '*[data-app-basemap-action="stopLayout"]', function(e) {
        $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'off');

        // Stopping ForceAtlas2
        s.stopForceAtlas2();

        // Refreshing thumbnails
        self.refreshThumbnails();

        e.preventDefault();

        // Dispatching
        self.dispatchEvent('layout.stop');
      });

      /**
       * Updating layout settings
       */
      dom.on('change', '*[data-app-basemap-layout-option]', function(e) {
        var settings = app.control.expand('forceAtlasConfig'),
            opt = {};

        opt[$(this).attr('data-app-basemap-layout-option')] =
          value = $(this).is('[type=checkbox]') ?
            $(this).prop('checked') :
            +$(this).val();

        self.dispatchEvent('layout.update', app.utils.extend(opt, settings));
      });
    };

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

    // TODO: this is messy, find a more suited way
    this.openPanel = function(kind) {
      var path = kind === 'force' ? 'basemap.forcePanel' : 'misc.categoryPanel',
          dom = self.dom;

      if (this.openedPanel === kind)
        return;

      this.openedPanel = kind;

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

      this.resizeGraph();
    };

    this.resizeGraph = function() {
      s.renderers.main.resize();
      s.renderers.main.render();
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
    // this.triggers.events.metaUpdated = this.renderCategories;
    this.triggers.events['layout.updated'] = function(d, e) {
      s.configForceAtlas2(e.data);
    };

    // Initialization
    this.didRender = function() {
      this.renderCategories();
    }

    // On unmounting the pane
    this.willUnmount = function() {

      // Destroying thumbnails
      this.unmountThumbnails();

      // Killing layout
      s.killForceAtlas2();
    };
  }
}).call(this);
