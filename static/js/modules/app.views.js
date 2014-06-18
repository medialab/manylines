;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.views = function(dom, d) {
    var self = this,
        sigmaController = new app.utils.sigmaController('views', dom, d),
        thumbnails = new app.utils.sigmaThumbnails(dom, d),
        s = d.get('mainSigma');

    /**
     * Methods
     */
    this.renderSnapshots = function() {
      app.templates.require('app.views.snapshot', function(snapshotTemplate) {

        $('.views-band', dom).empty().append(
          snapshotTemplate({snapshots: d.get('snapshots')})
        );
      });
    };

    this.kill = function() {
      sigmaController.killRenderer();
    };

    // TODO: create custom abstraction for this?
    // Columns layout
    function openPanel(panelName, options) {
      options = options || {};

      app.templates.require('app.views.' + panelName, function(template) {
        var panel;
        dom.find('*[data-app-views-panel="sidebar"]').find('.active').removeClass('active');

        panel = $(template(options.category));
        $('.network-item[data-app-thumbnail-category="' + options.category.id + '"]', dom).addClass('active');
        s.mapColors(options.category);

        // Events:
        $('.tirette', panel).click(function(e) {
          closePanel();
          e.preventDefault();
        });

        // Deal with panel
        dom.find('*[data-app-views-panel="sigma"]').removeClass('col-xs-9').addClass('col-xs-6');
        dom.find('.col-middle').show().empty().append(panel);
        $('.forcelayout-container .tirette', dom).hide();
        sigmaController.renderer.resize();
        sigmaController.renderer.render();
      });
    }

    function closePanel() {
      dom.find('*[data-app-views-panel="sidebar"]').find('.active').removeClass('active');
      dom.find('*[data-app-views-panel="sigma"]').removeClass('col-xs-6').addClass('col-xs-9');
      dom.find('.col-middle').empty().hide();

      s.mapColors();
      sigmaController.renderer.resize();
      sigmaController.renderer.render();
    }


    /**
     * Initialization
     */

    // Rendering snapshots for the first time
    this.renderSnapshots();

    /**
     * Bindings
     */
    $('[data-app-view-action]', dom).click(function(e) {
      var action = $(this).attr('data-app-view-action');

      if (action === 'snapshot') {

        // We take a snapshot of the graph

        // Feedback
        // TODO: trigger a modal cf. issue #38
        if (!d.get('spaceId')) {
          app.danger('dev - graph not saved, you cannot take snapshots.');
          e.preventDefault();
          return;
        }

        // TODO: retrieve filter

        // Dispatch event
        self.dispatchEvent('takeSnapshot');
      }

      e.preventDefault();
    });

    // TODO: DRY this up!
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

    // TODO: DRY this up!
    dom.on('click', '.category-item', function(e) {
      var t = $(e.target),
          value,
          cat;
      t = t.hasClass('.category-item') ? t : t.parents('.category-item');

      value = t.find('.cat-item-label').text(),
      cat = $('.network-item.active', dom).attr('data-app-thumbnail-category');

      $('.category-item', dom).addClass('cat-item-muted');
      t.removeClass('cat-item-muted');

      // Highlighting category
      s.highlight(cat, value);
    });

    /**
     * Receptors
     */
    this.triggers.events.snapshotsUpdated = this.renderSnapshots;

    // TODO: DRY this up!
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
}).call(this);
