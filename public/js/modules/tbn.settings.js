;(function() {
  'use strict';

  tbn.pkg('tbn.modules');
  tbn.modules.settings = function(dom, d) {
    var self = this;

    $('*[data-tbn-settings-meta]', dom).change(function() {
      var el = $(this);
      self.dispatchEvent('updateMetaKey', {
        key: el.attr('data-tbn-settings-meta'),
        value: el.val()
      });
    });

    $('button[data-tbn-settings-space-update]', dom).click(function() {
      var el = $(this);
      self.dispatchEvent('saveSpaceKey', {
        key: el.attr('data-tbn-settings-space-update'),
        value: el.parents('.input-group').find('input[data-tbn-settings-space]').val()
      });
    });

    $('button[data-tbn-settings-action]', dom).click(function() {
      self.dispatchEvent($(this).attr('data-tbn-settings-action'));
    });

    function refresh() {
      // Graph meta:
      var meta = d.get('meta') || {};
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
    this.triggers.events.metaUpdated = refresh;
    this.triggers.events.spaceUpdated = refresh;
  };
}).call(this);
