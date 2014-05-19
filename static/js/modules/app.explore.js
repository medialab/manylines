;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.explore = function(dom, d) {
    var self = this,
        renderer = d.get('mainSigma').addRenderer({
          container: $('.sigma-panel .sigma-expand', dom)[0],
          camera: 'mainCamera',
          id: 'tubemynet-explore'
        });

    // Refresh rendering:
    d.get('mainSigma').refresh();

    function refresh() {
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

    this.kill = function() {
      d.get('mainSigma').killRenderer('tubemynet-explore');
    };

    // Reference triggers:
    this.triggers.events.dataUpdated = refresh;
  };
}).call(this);
