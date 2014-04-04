;(function() {
  'use strict';

  tbn.pkg('tbn.modules');
  tbn.modules.settings = function(dom, d) {
    var self = this;

    function refresh() {
      // Graph meta:
      var meta = d.get('graphMeta') || {};
      $('*[data-tbn-settings-meta]', dom).each(function() {
        var el = $(this);
        el.val(meta[el.attr('data-tbn-settings-meta')]);
      });

      // Space data:
      var space = d.get('space') || {};
      $('*[data-tbn-settings-space]', dom).each(function() {
        var el = $(this);
        el.val(space[el.attr('data-tbn-settings-space')]);
      });
    }

    refresh();

    // Reference triggers:
    this.triggers.events.graphMetaUpdated = refresh;
  };
}).call(this);
