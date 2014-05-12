;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.settings = function(dom, d) {
    var self = this;

    $('*[data-app-settings-meta]', dom).change(function() {
      var el = $(this);
      self.dispatchEvent('updateMetaKey', {
        key: el.attr('data-app-settings-meta'),
        value: el.val()
      });
    });

    $('button[data-app-settings-space-update]', dom).click(function() {
      var el = $(this);
      self.dispatchEvent('saveSpaceKey', {
        key: el.attr('data-app-settings-space-update'),
        value: el.parents('.input-group').find('input[data-app-settings-space]').val()
      });
    });

    $('button[data-app-settings-action]', dom).click(function() {
      self.dispatchEvent($(this).attr('data-app-settings-action'));
    });

    function refresh() {
      // Graph meta:
      var meta = d.get('meta') || {};
      $('*[data-app-settings-meta]', dom).each(function() {
        var el = $(this);
        el.val(meta[el.attr('data-app-settings-meta')]);
      });

      // Space data:
      var space = d.get('space') || {};
      $('*[data-app-settings-space]', dom).each(function() {
        var el = $(this);
        el.val(space[el.attr('data-app-settings-space')]);
      });
    }

    refresh();

    // Reference triggers:
    this.triggers.events.metaUpdated = refresh;
    this.triggers.events.spaceUpdated = refresh;
  };
}).call(this);
