;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.views = function(dom, d) {
    var self = this,
        sigmaController = new app.utils.sigmaController('views', dom, d),
        thumbnails = new app.utils.sigmaThumbnails(dom, d);

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
