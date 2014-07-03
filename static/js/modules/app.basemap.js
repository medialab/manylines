;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.basemap = function(dom, d) {
    var self = this,
        FA2config = {},
        s = d.get('mainSigma'),
        sigmaController = new app.utils.sigmaController('basemap', dom, d);

    /**
     * Properties
     */
    this.filter = new app.classes.filter(d);
    this.thumbnails = [];

    // Bind layout:
    $('*[data-app-basemap-action="startLayout"]', dom).click(function(e) {
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'on');
      s.configForceAtlas2(app.utils.extend(FA2config, app.defaults.forceAtlas2));
      s.startForceAtlas2();
      openPanel('app.basemap.forcePanel');
      e.preventDefault();

      // Dispatching layout
      self.dispatchEvent('graphLayout', s.getGraph());
    });

    $('*[data-app-basemap-action="stopLayout"]', dom).click(function(e) {
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'off');
      s.stopForceAtlas2();
      e.preventDefault();

      self.thumbnails.forEach(function(t) {
        t.refresh();
      });

      // Dispatching layout
      self.dispatchEvent('graphLayout', s.getGraph());
    });

    // Bind layout options
    dom.on('change', '*[data-app-basemap-layout-option]', function(e) {
      var option = $(this).attr('data-app-basemap-layout-option'),
          value = $(this).is('[type=checkbox]') ?
            $(this).prop('checked') :
            +$(this).val();


      // Tweak behavior of settings
      if(option === 'linLogMode'){
        if(value){
          FA2config['strongGravityMode'] = false;
          FA2config['scalingRatio'] = 0.2;
          FA2config['slowDown'] = 1;
        } else {
          FA2config['strongGravityMode'] = true;
          FA2config['scalingRatio'] = 10;
          FA2config['slowDown'] = 2;
        }
      }

      if (option === 'gravity')
        value = (+value) / 1000;

      // Update forceAtlas
      FA2config[option] = value;

      s.configForceAtlas2(app.utils.extend(FA2config, app.defaults.forceAtlas2));

      // Dispatch event to update metas
      self.dispatchEvent('updateLayoutOptions', FA2config);
    });

    // Bind node sizes
    dom.on('change', '*[data-app-basemap-layout-nodesize]', function(e){
      var value = $(this).attr('data-app-basemap-layout-nodesize');
      s.mapSizes(value);

      FA2config['nodesize'] = value;

      // Dispatch event to update metas
      self.dispatchEvent('updateLayoutOptions', FA2config);
    });

    // Blur inputs on press enter
    dom.on('keypress', '*[data-app-basemap-layout-option]', function(e) {
      if(e.which == 13){
        $(this).blur();
      }
    })

    // Other buttons
    $('.forcelayout-container .tirette', dom).click(function(e) {
      openPanel('app.basemap.forcePanel');
      e.preventDefault();
    });

    // TODO: DRY this up!
    dom.on('click', '.network-item', function(e) {
      var cat,
          t = $(e.target);
      t = t.hasClass('.network-item') ? t : t.parents('.network-item');
      cat = t.attr('data-app-thumbnail-category');

      // Updating filter's category
      self.filter.clear();
      self.filter.set(cat);
      if (typeof self.filter.category === 'object')
        openPanel('app.misc.categoryPanel', {
          category: self.filter.category
        });
    });

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

      // Updating sigma
      s.highlight(self.filter);
    });

    // If we click elsewhere, we reinitialize the filter
    dom.on('click', '.categories-container', function(e) {
      if (e.target !== this && !$(e.target).is('.title'))
        return;

      self.filter.removeAll();
      $('.category-item', dom).removeClass('cat-item-muted active');

      // Updating sigma
      s.highlight(self.filter);
    });

    // Columns layout
    function openPanel(panelName, options) {
      options = options || {};

      app.templates.require(panelName, function(template) {
        var panel;
        dom.find('*[data-app-basemap-panel="sidebar"]').find('.active').removeClass('active');

        switch (panelName) {
          case 'app.basemap.forcePanel':
            panel = $(template(app.utils.extend((d.get('meta') || {}).layout, app.defaults.forceAtlas2)));
            s.mapColors();
            $('.forcelayout-container', dom).addClass('active');
            break;
          case 'app.misc.categoryPanel':
            panel = $(template(options.category));
            $('.network-item[data-app-thumbnail-category="' + options.category.id + '"]', dom).addClass('active');
            s.mapColors(options.category);
            break;
        }

        // Events:
        $('.tirette', panel).click(function(e) {
          closePanel();
          e.preventDefault();
        });

        // Deal with panel
        dom.find('*[data-app-basemap-panel="sigma"]').removeClass('col-xs-9').addClass('col-xs-6');
        dom.find('.col-middle').show().empty().append(panel);
        $('.forcelayout-container .tirette', dom).hide();
        sigmaController.renderer.resize();
        sigmaController.renderer.render();
      });
    }

    function closePanel() {
      dom.find('*[data-app-basemap-panel="sidebar"]').find('.active').removeClass('active');
      dom.find('*[data-app-basemap-panel="sigma"]').removeClass('col-xs-6').addClass('col-xs-9');
      dom.find('.col-middle').empty().hide();
      $('.forcelayout-container .tirette', dom).show();

      s.mapColors();
      sigmaController.renderer.resize();
      sigmaController.renderer.render();
    }

    this.kill = function() {
      s.mapColors();
      s.killForceAtlas2();
      sigmaController.killRenderer();
      this.thumbnails.forEach(function(t) {
        t.kill();
      });
    };

    this.triggers.events.metaUpdated = function(d) {
      var w,
          h;

      // Display categories on sidebar:
      app.templates.require('app.misc.category', function(template) {
        var container = $('.subcontainer-networklist', dom).empty();
        ((((d.get('meta') || {}) || {}).model || {}).node || []).forEach(function(o) {
          if (o.noDisplay)
            return;

          $(template(o)).appendTo(container);

          // Creating thumbnails
          self.thumbnails.push(
            $('[data-app-thumbnail-category="' + o.id + '"] .network-thumbnail').thumbnail(s, {category: o})
          );
        });

        // Refreshing sigma
        s.refresh();

        // Rendering thumbnails
        self.thumbnails.forEach(function(t) {
          t.refresh();
        });
      });
    };
    this.triggers.events.metaUpdated(d);
  };

  // Specify for layout:
  app.modules.basemap.sigmaLayout = true;
}).call(this);
