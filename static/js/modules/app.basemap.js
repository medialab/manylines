;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.basemap = function(dom, d) {
    var self = this,
        s = d.get('mainSigma'),
        renderer = s.addRenderer({
          container: $('.sigma-panel .sigma-expand', dom)[0],
          camera: 'mainCamera',
          id: 'tubemynet-basemap'
        });

    // Display categories on sidebar:
    app.templates.require('app.basemap.category', function(template) {
      var container = $('.subcontainer-networklist', dom);
      (d.get('meta').model || []).forEach(function(o) {
        container.append(template(o));
      });
    });

    // Refresh rendering:
    s.refresh();

    // Bind sigma buttons:
    $('*[data-app-basemap-action="zoom"]', dom).click(function() {
      var cam = s.cameras.mainCamera;

      sigma.misc.animation.camera(
        cam,
        { ratio: cam.ratio / 1.5 },
        { duration: 150 }
      );
    });
    $('*[data-app-basemap-action="unzoom"]', dom).click(function() {
      var cam = s.cameras.mainCamera;

      sigma.misc.animation.camera(
        cam,
        { ratio: cam.ratio * 1.5 },
        { duration: 150 }
      );
    });
    $('*[data-app-basemap-action="recenter"]', dom).click(function() {
      var cam = s.cameras.mainCamera;

      sigma.misc.animation.camera(
        cam,
        { x: 0,
          y: 0,
          angle: 0,
          ratio: 1 },
        { duration: 150 }
      );
    });

    // Columns layout
    function openPanel(panelName, options) {
      if (dom.filter('.col-middle').children().length)
        return;

      options = options || {};

      app.templates.require('app.basemap.' + panelName, function(template) {
        var panel;

        switch (panelName) {
          case 'forcePanel':
            panel = $(template(d.get('meta').layout));
            break;
          case 'categoryPanel':
            panel = $(template(options.category));
            break;
        }

        // Events:
        $('.tirette', panel).click(function(e) {
          closePanel();
          e.preventDefault();
        });

        // Deal with panel
        dom.filter('*[data-app-basemap-panel="sigma"]').removeClass('col-xs-9').addClass('col-xs-6');
        dom.filter('.col-middle').show().append(panel);
        $('.forcelayout-container .tirette', dom).hide();
        renderer.resize();
        renderer.render();
      });
    }

    function closePanel() {
      dom.filter('*[data-app-basemap-panel="sigma"]').removeClass('col-xs-6').addClass('col-xs-9');
      dom.filter('.col-middle').empty().hide();
      $('.forcelayout-container .tirette', dom).show();
      renderer.resize();
      renderer.render();
    }

    // Bind layout:
    $('*[data-app-basemap-action="startLayout"]', dom).click(function(e) {
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'on');
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

      // Dispatching layout
      self.dispatchEvent('graphLayout', s.getGraph());
    });

    // Bind layout options:
    var FA2config = {};
    dom.on('change', '*[data-app-basemap-layout-option]', function(e) {
      var option = $(this).attr('data-app-basemap-layout-option'),
          value = $(this).is('[type=checkbox]') ?
            $(this).prop('checked') :
            +$(this).val();

      // Update forceAtlas
      FA2config[option] = value;
      s.configForceAtlas2(FA2config);

      // Dispatch event to update metas
      self.dispatchEvent('updateLayoutOptions', FA2config);
    });

    // Other buttons:
    $('.forcelayout-container .tirette', dom).click(function(e) {
      openPanel('forcePanel');
      e.preventDefault();
    });

    this.kill = function() {
      s.killForceAtlas2();
      s.killRenderer('tubemynet-basemap');
    };
  };

  // Specify for layout:
  app.modules.basemap.sigmaLayout = true;
}).call(this);
