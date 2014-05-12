;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.explore = function(dom, d) {
    var self = this,
        sig = new sigma({
          container: $('.sigma-panel .sigma-expand', dom)[0]
        });

    function refresh() {
      // Refresh sigma rendering:
      sig.graph.clear().read(d.get('graph') || {});
      sig.refresh();

      // Refresh texts:
      $('*[data-app-explore]', dom).each(function() {
        var val,
            el = $(this),
            attr = el.attr('data-app-explore');

        switch (attr) {
          case 'node':
          case 'edge':
            el.text(i18n.t('graph.' + attr, {
              count: ((d.get('graph') || {})[attr + 's'] || []).length
            }));
            break;
          case 'layout':
          case 'mode':
            val = d.get('explore-' + attr);
            if (val)
              el.text(i18n.t('explore.' + val)).show();
            else
              el.text('').hide();
            break;
        }
      });
    }

    refresh();

    // Reference triggers:
    this.triggers.events.graphUpdated = refresh;
  };
}).call(this);
