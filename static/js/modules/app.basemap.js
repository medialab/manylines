;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.basemap = function(dom, d) {
    var self = this,
        FA2config = {},
        s = d.get('mainSigma'),
        sigmaController = new app.utils.sigmaController('basemap', dom, d),
        thumbnails = new app.utils.sigmaThumbnails(dom, d);

    // Bind layout:
    $('*[data-app-basemap-action="startLayout"]', dom).click(function(e) {
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'on');
      s.configForceAtlas2(app.utils.extend(FA2config, app.defaults.forceAtlas2));
      s.startForceAtlas2();
      openPanel('forcePanel');
      e.preventDefault();

      // Dispatching layout
      self.dispatchEvent('graphLayout', s.getGraph());
    });

    $('*[data-app-basemap-action="stopLayout"]', dom).click(function(e) {
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'off');
      s.stopForceAtlas2();
      e.preventDefault();
      thumbnails.refresh();

      // Dispatching layout
      self.dispatchEvent('graphLayout', s.getGraph());
    });

    // Bind layout options:
    dom.on('change', '*[data-app-basemap-layout-option]', function(e) {
      var option = $(this).attr('data-app-basemap-layout-option'),
          value = $(this).is('[type=checkbox]') ?
            $(this).prop('checked') :
            +$(this).val();


      // Tweak behavior of settings
      if(option == "linLogMode"){
        if(value){
          FA2config['strongGravityMode'] = false
          FA2config['scalingRatio'] = 0.2
          FA2config['slowDown'] = 1
        } else {
          FA2config['strongGravityMode'] = true
          FA2config['scalingRatio'] = 10
          FA2config['slowDown'] = 2
        }
      }

      if (option === 'gravity')
        value /= 1000;

      // Update forceAtlas
      FA2config[option] = value;

      s.configForceAtlas2(app.utils.extend(FA2config, app.defaults.forceAtlas2));

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
      openPanel('forcePanel');
      e.preventDefault();
    });

    dom.on('click', '.network-item', function(e) {
      var cat,
          t = $(e.target);
      t = t.hasClass('.network-item') ? t : t.parents('.network-item');
      cat = t.attr('data-app-thumbnail-category');

      ((d.get('meta').model || {}).node || []).some(function(o) {
        return o.id === cat ? (cat = o) : false;
      });

      if (typeof cat === 'object')
        openPanel('categoryPanel', {
          category: cat
        });
    });

    // Columns layout
    function openPanel(panelName, options) {
      options = options || {};

      app.templates.require('app.basemap.' + panelName, function(template) {
        var panel;
        dom.find('*[data-app-basemap-panel="sidebar"]').find('.active').removeClass('active');

        switch (panelName) {
          case 'forcePanel':
            panel = $(template(app.utils.extend((d.get('meta') || {}).layout, app.defaults.forceAtlas2)));
            s.mapColors();
            $('.forcelayout-container', dom).addClass('active');
            break;
          case 'categoryPanel':
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
        });

        thumbnails.init();
      });
    };
    this.triggers.events.metaUpdated(d);
  };

  // Specify for layout:
  app.modules.basemap.sigmaLayout = true;
}).call(this);
