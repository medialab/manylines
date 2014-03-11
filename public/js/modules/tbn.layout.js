;(function() {
  'use strict';

  tbn.pkg('tbn.modules');

  tbn.modules.layout = function(control) {
    var self = this,
        module;

    function bindDOM(dom) {
      // TODO
      // Finish this function to bind all the tbn.modules.dom* from modules/tbn.misc.js

      // $('[data-tbn-domText]:not(.tbn-hasModule)', dom).each(function() {
      //   control.addModule(tbn.modules.domText, [$(this).data('tbn-domText'), $(this)]);
      // });
    }

    // Initialize hash module:
    control.addModule(tbn.modules.location);

    // Initialize DOM modules:
    // TODO

    // Bind layout triggers:
    this.triggers.events.viewUpdated = function(d) {
      var view = d.get('view'),
          template = tbn.templates.require('tbn.' + view, function(template) {
            var dom = $(template());
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
