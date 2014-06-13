;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.basemap = function(dom, d) {
    var self = this,
        thumbnails,
        FA2config = {},
        s = d.get('mainSigma'),
        sigmaController = new app.utils.sigmaController('basemap', dom, d);

    // Bind layout:
    $('*[data-app-basemap-action="startLayout"]', dom).click(function(e) {
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'on');
      s.startForceAtlas2(app.utils.extend(FA2config, app.defaults.forceAtlas2));
      openPanel('forcePanel');
      e.preventDefault();

      // Dispatching layout
      self.dispatchEvent('graphLayout', s.getGraph());
    });
    $('*[data-app-basemap-action="stopLayout"]', dom).click(function(e) {
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'off');
      s.stopForceAtlas2();
      e.preventDefault();
      refreshThumbnails();

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
      s.configForceAtlas2(app.utils.extend(FA2config, app.defaults.forceAtlas2));

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
        dom.find('*[data-app-basemap-panel="sidebar"]').find('.active').removeClass('active');

        switch (panelName) {
          case 'forcePanel':
            panel = $(template(app.utils.extend((d.get('meta') || {}).layout, app.defaults.forceAtlas2)));
            mapColors();
            break;
          case 'categoryPanel':
            panel = $(template(options.category));
            $('.network-item[data-app-basemap-category="' + options.category.id + '"]', dom).addClass('active');
            mapColors(options.category);
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

      mapColors();
      sigmaController.renderer.resize();
      sigmaController.renderer.render();
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
      sigmaController.killRenderer();
    };

    function initThumbnails() {
      killThumbnails();
      thumbnails = {};

      ((((d.get('meta') || {}) || {}).model || {}).node || []).forEach(function(o) {
        if (o.noDisplay)
          return;

        thumbnails[o.id] = s.addRenderer({
          prefix: s.cameras.staticCamera.readPrefix,
          type: 'thumbnail',
          camera: 'staticCamera',
          container: $('*[data-app-basemap-category="' + o.id + '"] .network-thumbnail', dom)[0],
          category: o.id,
          values: o.values.reduce(function(res, obj) {
            res[obj.id] = obj.color;
            return res;
          }, {})
        });

        thumbnails[o.id].resize();
      });

      // WARNING:
      // If it does not work, use an iframe.
      // If it still does not work, use setTimeout.
      // If it still does not work, you're screwed.
      setTimeout(refreshThumbnails, 0);
    }

    function refreshThumbnails() {
      var k,
          container = $('.network-thumbnail', dom).first(),
          w = container.width(),
          h = container.height();

      sigma.middlewares.rescale.call(
        s,
        '',
        s.cameras.staticCamera.readPrefix,
        {
          width: w,
          height: h
        }
      );

      for (k in thumbnails || {})
        thumbnails[k].doRender();
    }

    function killThumbnails() {
      var k;
      for (k in thumbnails)
        s.killRenderer(thumbnails[k]);
      thumbnails = null;
    }

    this.triggers.events.metaUpdated = function(d) {
      var w,
          h;

      // Display categories on sidebar:
      app.templates.require('app.basemap.category', function(template) {
        var container = $('.subcontainer-networklist', dom).empty();
        ((((d.get('meta') || {}) || {}).model || {}).node || []).forEach(function(o) {
          if (o.noDisplay)
            return;

          $(template(o)).appendTo(container);
        });

        initThumbnails();
      });
    };
    this.triggers.events.metaUpdated(d);
  };

  // Specify for layout:
  app.modules.basemap.sigmaLayout = true;
}).call(this);
