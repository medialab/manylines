;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.basemap = function(dom, d) {
    var self = this,
        renderer = d.get('mainSigma').addRenderer({
          container: $('.sigma-panel .sigma-expand', dom)[0],
          camera: 'mainCamera',
          id: 'tubemynet-basemap'
        });

    // Refresh rendering:
    d.get('mainSigma').refresh();

    function refresh() {
      // Refresh texts:
      $('*[data-app-basemap]', dom).each(function() {
        var val,
            el = $(this),
            attr = el.attr('data-app-basemap');

        switch (attr) {
          case 'node':
          case 'edge':
            el.text(i18n.t('graph.' + attr, {
              count: ((d.get('graph') || {})[attr + 's'] || []).length
            }));
            break;
          case 'layout':
          case 'mode':
            val = d.get('basemap-' + attr);
            if (val)
              el.text(i18n.t('basemap.' + val)).show();
            else
              el.text('').hide();
            break;
        }
      });
    }

    refresh();

    this.kill = function() {
      d.get('mainSigma').killRenderer('tubemynet-basemap');
    };

    // Reference triggers:
    this.triggers.events.dataUpdated = refresh;
  };
}).call(this);
