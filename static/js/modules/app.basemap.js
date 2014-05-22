;(function() {
  'use strict';

  Handlebars.registerHelper('basemap_categories', function(obj) {
    return new Handlebars.SafeString(i18n.t('graph.category', {
      count: Object.keys(obj || {}).length
    }));
  });

  app.pkg('app.modules');
  app.modules.basemap = function(dom, d) {
    var self = this,
        s = d.get('mainSigma'),
        renderer = s.addRenderer({
          container: $('.sigma-panel .sigma-expand', dom)[0],
          camera: 'mainCamera',
          id: 'tubemynet-basemap'
        });

    // ForceAtlas2 configuration
    var defaultFA2config = {
          strongGravityMode: true,
          gravity: 0.01,
          scalingRatio: 10
        },
        FA2config = {};


    // Display categories on sidebar:
    app.templates.require('app.basemap.category', function(template) {
      var container = $('.subcontainer-networklist', dom);
      (d.get('meta').model || []).forEach(function(o) {
        if (!o.noDisplay)
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

    // Bind layout:
    $('*[data-app-basemap-action="startLayout"]', dom).click(function(e) {
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'on');
      s.startForceAtlas2(FA2config);
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
    dom.on('click', '.network-item', function(e) {
      var cat,
          t = $(e.target);
      t = t.hasClass('.network-item') ? t : t.parents('.network-item');
      cat = t.attr('data-app-basemap-category');

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

        switch (panelName) {
          case 'forcePanel':
            FA2config = (d.get('meta') || {}).layout || defaultFA2config;
            panel = $(template(FA2config));
            mapColors();
            break;
          case 'categoryPanel':
            panel = $(template(options.category));
            mapColors(options.category);
            break;
        }

        // Events:
        $('.tirette', panel).click(function(e) {
          closePanel();
          e.preventDefault();
        });

        // Deal with panel
        dom.filter('*[data-app-basemap-panel="sigma"]').removeClass('col-xs-9').addClass('col-xs-6');
        dom.filter('.col-middle').show().empty().append(panel);
        $('.forcelayout-container .tirette', dom).hide();
        renderer.resize();
        renderer.render();
      });
    }

    function closePanel() {
      dom.filter('*[data-app-basemap-panel="sigma"]').removeClass('col-xs-6').addClass('col-xs-9');
      dom.filter('.col-middle').empty().hide();
      $('.forcelayout-container .tirette', dom).show();

      mapColors();
      renderer.resize();
      renderer.render();
    }

    function mapColors(cat) {
      var colors = cat ? cat.values.reduce(function(res, o) {
        res[o.id] = o.color;
        return res;
      }, {}) : null;
      s.graph.nodes().forEach(function(n) {
        n.trueColor = n.trueColor || n.color;
        n.color = cat ? colors[n.attributes[cat.id]] : n.trueColor;
      });

      s.refresh();
    }

    this.kill = function() {
      mapColors();
      s.killForceAtlas2();
      s.killRenderer('tubemynet-basemap');
    };

    this.triggers.events.metaUpdated = function(d) {
      // Display categories on sidebar:
      app.templates.require('app.basemap.category', function(template) {
        var container = $('.subcontainer-networklist', dom).empty();
        (((d.get('meta') || {}).model || {}).node || []).forEach(function(o) {
          if (!o.noDisplay)
            container.append(template(o));
        });
      });
    };
    this.triggers.events.metaUpdated(d);
  };

  // Specify for layout:
  app.modules.basemap.sigmaLayout = true;
}).call(this);
