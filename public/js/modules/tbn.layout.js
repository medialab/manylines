;(function() {
  'use strict';

  tbn.pkg('tbn.modules');

  tbn.modules.layout = function(control) {
    var self = this,
        module;

    function bindDOM(dom) {
      /**
       * This function checks if a DOM element is already used in a TBN module
       * or not, by marking it with a DOM attribute:
       */
      function checkModule(dom, module) {
        if (dom.data('tbn-module-' + module))
          return false;
        else
          return dom.attr('data-tbn-module-' + module, 'true');
      }

      // Simple modules:
      [
        'domShow',
        'domHide',
        'domClick'
      ].forEach(function(module) {
        $('*[data-tbn-' + module + ']', dom).each(function() {
          var dom = $(this);
          if (checkModule(dom, module))
            control.addModule(tbn.modules[module], [dom.attr('data-tbn-' + module + ''), dom]);
        });
      });
    }

    // Hash module:
    control.addModule(tbn.modules.location);

    // Views panel:
    control.addModule(tbn.modules.viewsPanel);

    // DOM modules:
    bindDOM(tbn.dom);

    // Bind layout triggers:
    this.triggers.events.viewUpdated = function(d) {
      var template,
          view = d.get('view');

      // Update DOM view:
      tbn.dom.attr('data-tbn-view', view);

      tbn.templates.require('tbn.' + view, function(template) {
        var dom = $(template()).i18n();
        $('.main', tbn.dom).empty().filter(':visible').append(dom);

        // Reinitialize module:
        if (module)
          control.killModule(module);

        module = control.addModule(tbn.modules[view], [dom]);

        // Unlock UI:
        self.dispatchEvent('unlock');
      });

      // Lock UI until the template is loaded:
      self.dispatchEvent('lock');
    };
  };
}).call(this);
